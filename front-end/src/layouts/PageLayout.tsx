// LAYOUT WRAPPER CHUNG CHO CÁC TRANG
import TopNavbar from "../components/TopNavbar";

const PageLayout = ({title, children}: {title: string, children: React.ReactNode}) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <TopNavbar />
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-3xl font-bold mb-4">{title}</h1>
                <div className="p-6 rounded shadow">
                    {children}
                </div>
            </div>
        </div>
    );
};
    
export default PageLayout;