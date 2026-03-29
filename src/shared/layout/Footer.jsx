import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTwitter, FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";

function Footer() {
  const navigate = useNavigate();

  const socialIcons = [
    { icon: <FaTwitter size={17} />, key: "twitter" },
    { icon: <FaLinkedinIn size={17} />, key: "linkedin" },
    { icon: <FaGithub size={17} />, key: "github" },
    { icon: <FaInstagram size={17} />, key: "instagram" },
  ];

  const productLinks = [
    ["Templates", () => navigate("/templates")],
    ["AI Analyze", () => navigate("/analyzer")],
    ["Features", () => {
      const section = document.getElementById("features");
      if (section) section.scrollIntoView({ behavior: "smooth" });
      else navigate("/notfound");
    }],
    ["How It Works", () => {
      const section = document.getElementById("how-it-works");
      if (section) section.scrollIntoView({ behavior: "smooth" });
      else navigate("/notfound");
    }],
  ];

  const resourceLinks = [
    ["CV Writing Guide", "/cv-writing-guide"],
    ["Cover Letter Tips", "/cover-letter-tips"],
    ["Career Blog", "/career-blog"],
    ["FAQ", "/faq"],
  ];

  const legalLinks = [
    ["Privacy Policy", "/privacypolicy"],
    ["Terms of Service", "/servicepolicy"],
    ["Cookie Policy", "/cookie-policy"],
    ["Contact", "/contact"],
  ];

  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (err) {
      navigate("/notfound");
    }
  };

  return (
    <footer className="bg-slate-950 text-white py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Brand */}
          <div className="lg:col-span-4 flex flex-col">
            <div
              className="flex items-center gap-2 mb-4 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img
                  src="/CVEX Logo Design.png"
                  alt="CVEX Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">
              Analyze your CV with AI and build professional, ATS-friendly CVs in minutes.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 mt-4">
              {socialIcons.map(({ icon, key }) => (
                <button
                  key={key}
                  className="group w-10 h-10 rounded-lg bg-gray-800 hover:bg-purple-400 flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                    {icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 flex flex-col md:flex-row md:justify-between gap-10 md:mt-10 md:mt-0 md:ml-20">

            {/* Product */}
            <div className="flex-1">
              <div className="font-semibold mb-4">Product</div>
              <ul className="space-y-2 text-sm">
                {productLinks.map(([text, fn]) => (
                  <li key={text}>
                    <button
                      className="hover:text-purple-300  transition-colors duration-200 text-left cursor-pointer"
                      onClick={fn}
                    >
                      {text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>


            {/* Legal */}
            <div className="flex-1">
              <div className="font-semibold mb-4">Legal</div>
              <ul className="space-y-2 text-sm">
                {legalLinks.map(([text, path]) => (
                  <li key={text}>
                    <button
                      className="hover:text-purple-300 transition-colors duration-200 text-left cursor-pointer"
                      onClick={() => safeNavigate(path)}
                    >
                      {text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>


            {/* Resources */}
            <div className="flex-1">
              <div className="font-semibold mb-4">Resources</div>
              <ul className="space-y-2 text-sm">
                {resourceLinks.map(([text, path]) => (
                  <li key={text}>
                    <button
                      className="hover:text-purple-300  transition-colors duration-200 text-left cursor-pointer"
                      onClick={() => safeNavigate(path)}
                    >
                      {text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>



          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-smtext-gray-400 -mb-8 transition-colors duration-300">
          © {new Date().getFullYear()} CVEX. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;