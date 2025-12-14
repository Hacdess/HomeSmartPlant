import { LeafIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return(
    <header className="flex flex-row justify-between mx-auto max-w-5xl p-4 sm:p-6 lg: p-8">
      <Link to={"/"} className="flex items-center gap-2">
        <LeafIcon className="text-primary" />
        <h1 className="text-font text-xl text-primary"> SmartPlant</h1>
      </Link>
      <div className="flex flex-row justify-center items-center gap-5">
        <Link to="sign-in" className="text-muted-foreground hover:text-green-600">
            Đăng nhập
        </Link>
        <Link to="/sign-up" className="text-foreground bg-green-600 px-4 py-2 rounded hover:bg-green-700">
            Đăng ký
        </Link>
      </div>
    </header>
  )
}