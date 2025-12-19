import Navbar from '@/components/shop/Navbar';

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <footer className="border-t border-border py-8 bg-secondary/30 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>© 2024 Scarlet Fashion. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
