import Stripe from 'stripe';
import Order from '../modals/order.js';
import Restaurant from '../modals/restaurantModel.js';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Order
export const createOrder = async (req, res) => {
    try {
        const {
            firstName, lastName, phone, email,
            address, city, zipCode,
            paymentMethod, subtotal, tax, total,
            items
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty items array' });
        }

        const orderItems = items.map(({ item, name, price, imageUrl, quantity }) => {
            const base = item || {};
            return {
                item: {
                    name: base.name || name || 'Unknown',
                    price: Number(base.price ?? price) || 0,
                    imageUrl: base.imageUrl || imageUrl || ''
                },
                quantity: Number(quantity) || 0
            };
        });

        const shippingCost = 0;
        let newOrder;

        if (paymentMethod === 'online') {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: orderItems.map(o => ({
                    price_data: {
                        currency: 'inr',
                        product_data: { name: o.item.name },
                        unit_amount: Math.round(o.item.price * 100)
                    },
                    quantity: o.quantity
                })),
                customer_email: email,
                success_url: `${process.env.FRONTEND_URL}/myorder/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
                metadata: { firstName, lastName, email, phone }
            });

            newOrder = new Order({
                user: req.user._id,
                firstName, lastName, phone, email,
                address, city, zipCode,
                paymentMethod, subtotal, tax, total,
                shipping: shippingCost,
                items: orderItems,
                paymentIntentId: session.payment_intent,
                sessionId: session.id,
                paymentStatus: 'pending'
            });

            await newOrder.save();
            return res.status(201).json({ order: newOrder, checkoutUrl: session.url });
        }

        // COD Handling
        newOrder = new Order({
            user: req.user._id,
            firstName, lastName, phone, email,
            address, city, zipCode,
            paymentMethod, subtotal, tax, total,
            shipping: shippingCost,
            items: orderItems,
            paymentStatus: 'succeeded'
        });

        await newOrder.save();
        res.status(201).json({ order: newOrder, checkoutUrl: null });
    } catch (error) {
        console.error('createOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Confirm Payment
export const confirmPayment = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ message: 'session_id required' });

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            const order = await Order.findOne({ sessionId: session_id });
            if (!order) return res.status(404).json({ message: 'Order not found' });

            order.paymentStatus = 'succeeded';
            await order.save();

            return res.json(order);
        }
        return res.status(400).json({ message: 'Payment not completed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get Orders for current user (User or Restaurant)
export const getOrders = async (req, res) => {
    try {
        let orders;

        if (req.user.role === 'restaurant') {
            // Fetch restaurant owned by user
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) return res.json([]);

            // Only orders that include items from this restaurant
            orders = await Order.find({
                "items.item._id": { $in: restaurant.menu }
            }).sort({ createdAt: -1 }).lean();
        } else if (req.user.role === 'user') {
            orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
        } else {
            // Admin
            orders = await Order.find().sort({ createdAt: -1 }).lean();
        }

        res.json(orders);
    } catch (error) {
        console.error('getOrders error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get All Orders (Admin only)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).lean();
        res.json(orders);
    } catch (error) {
        console.error('getAllOrders error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update Any Order (Admin)
export const updateAnyOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const { status, paymentStatus, expectedDelivery, deliveredAt } = req.body;

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (expectedDelivery) order.expectedDelivery = expectedDelivery;
        if (deliveredAt) order.deliveredAt = deliveredAt;

        await order.save();
        res.json(order);
    } catch (error) {
        console.error('updateAnyOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role === 'user' && !order.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (req.user.role === 'restaurant') {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            const restaurantItemIds = restaurant?.menu.map(id => id.toString()) || [];
            const orderItemIds = order.items.map(i => i.item._id.toString());
            if (!orderItemIds.some(id => restaurantItemIds.includes(id))) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        res.json(order);
    } catch (error) {
        console.error('getOrderById error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update Order (User)
export const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (!order.user.equals(req.user._id)) return res.status(403).json({ message: 'Access denied' });

        const { status, paymentStatus, expectedDelivery, deliveredAt, ...allowedFields } = req.body;
        Object.assign(order, allowedFields);

        await order.save();
        res.json(order);
    } catch (error) {
        console.error('updateOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
