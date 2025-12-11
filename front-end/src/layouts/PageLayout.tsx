// LAYOUT WRAPPER CHUNG CHO CÁC TRANG
import TopNavbar from "../components/TopNavbar";

const PageLayout = ({title, children}: {title: string, children: React.ReactNode}) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <TopNavbar />
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-4">{title}</h1>
                <div className="bg-white p-6 rounded shadow">
                    {children}
                </div>
            </div>
        </div>
    );
};
    
export default PageLayout;