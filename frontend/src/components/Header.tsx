import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FaHome, FaFileAlt, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const mobileButtonVariants = {
    collapsed: { scale: 1 },
    expanded: { scale: 1.2 },
  };

  const mobilePaletteVariants = {
    collapsed: { opacity: 0, scale: 0 },
    expanded: { opacity: 1, scale: 1 },
  };

  const menuItems = [
    { to: "/", icon: FaHome, label: "My projects" },
    { to: "/posts", icon: FaFileAlt, label: "My little posts" },
  ];

  if (isMobile) {
    return (
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
      >
        <motion.button
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg"
          onClick={() => setIsExpanded(!isExpanded)}
          variants={mobileButtonVariants}
        >
          {isExpanded ? <FaTimes size={24} /> : <FaBars size={24} />}
        </motion.button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute bottom-16 right-0 space-y-2"
              variants={mobilePaletteVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.to}
                  className="bg-indigo-600 text-white p-3 rounded-full shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center"
                  >
                    <item.icon size={20} />
                    <span className="ml-2">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-200 shadow-lg">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-accent-purple text-2xl font-bold">
            Ducheved
          </Link>
          <div className="flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-gray-400 hover:text-accent-blue transition-colors duration-200 flex items-center"
              >
                <item.icon size={20} className="mr-2" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
