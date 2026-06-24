import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo / Brand */}
          <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Explore the Unexplored
          </h3>
          
          {/* Quote */}
          <p className="text-primary-foreground/70 text-lg max-w-xl mb-8 italic">
            "The world is a book, and those who do not travel read only one page."
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-6 mb-8">
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-300"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-300"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-300"
              aria-label="Youtube"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-primary-foreground/20 pt-8 w-full">
            <p className="text-primary-foreground/60 text-sm">
              © 2024 Explore the Unexplored India. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
