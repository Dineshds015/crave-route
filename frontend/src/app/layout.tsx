import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { LoginModal } from '@/components/LoginModal';

export const metadata: Metadata = {
  title: 'CraveRoute — Premium Food Delivery & Live Kitchen Journey',
  description:
    'Discover delicious burgers, artisan pizzas, fresh pasta, and salads delivered with real-time SSE Kitchen Journey tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF9F5] text-[#19231D] min-h-screen flex flex-col font-sans antialiased selection:bg-[#C8F169] selection:text-[#183D2B]">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toast />
            <LoginModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
