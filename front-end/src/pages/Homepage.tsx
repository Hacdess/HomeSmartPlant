// HOME PAGE: GIOI THIIEU SAN PHAM, BUTTON SIGNIN/SIGNUP
import PageLayout from "../layouts/PageLayout";
import { useAuth } from "../contexts/AuthContext";

const Homepage = () => {
    return (
        <PageLayout title="Welcome to SmartPlant">
            <div className="text-center">
                <h2 className="text-xl mb-4">Your smart solution for plant care</h2>
            </div>
        </PageLayout>
    );
};
export default Homepage;