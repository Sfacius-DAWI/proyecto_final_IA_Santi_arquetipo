import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-playfair font-bold text-white italic">
                Adventure<span className="block -mt-1">Tours</span>
              </h2>
            </div>
            <p className="text-gray-300 mb-4">
              Stay updated! Subscribe to our newsletter for exclusive travel tips and offers!
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email address"
                className="px-4 py-2 w-full bg-white/10 border border-white/20 text-white rounded-l focus:outline-none"
              />
              <button className="bg-accent px-4 py-2 rounded-r font-medium">
                Subscribe now
              </button>
            </div>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-white hover:text-accent">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-accent">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">FAQ</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">Customer Service</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">How to Guides</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">Contact us</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Other</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">Sitemap</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">Subscriptions</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-300">
        <p>© 2025 Adventure Tours. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
