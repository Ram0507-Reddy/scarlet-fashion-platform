export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-border/50">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-primary">SCARLET</h1>
                    <p className="text-sm text-muted-foreground mt-2">Premium Fashion Experience</p>
                </div>
                {children}
            </div>
        </div>
    );
}
