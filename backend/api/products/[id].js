// /backend/api/products/[id].js
import connectDB from '@/utils/connectDB';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Gagal update produk' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Produk dihapus' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Gagal hapus produk' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
