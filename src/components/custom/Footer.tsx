import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#1b1b27] flex flex-col items-center justify-around gap-2 md:gap-4 py-10">
      <Link to="/" className="flex items-center">
        <img src="/assets/logoXL.png" alt="GGGE" className="h-8 md:h-10" />
      </Link>
      <hr />
      <div>{`copyright © ${new Date().getFullYear()}  GGGE`}</div>
      <hr />
      <div className="flex justify-center items-center space-x-4">
        <a href="#">Terms of Service</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Contact Us</a>
      </div>
    </footer>
  );
}
