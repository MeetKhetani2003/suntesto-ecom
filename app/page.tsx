"use client";

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PRODUCTS, IMAGES, springConfig, fastSpring } from '@/lib/data';
import { Footer } from '@/components/Footer';

// --- COMPONENTS ---

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 1.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[999] bg-[#111] flex flex-col items-center justify-center text-white origin-top"
    >
      <div className="overflow-hidden">
        <motion.h1 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="text-4xl md:text-6xl font-black tracking-tighter uppercase"
        >
          Sustento
        </motion.h1>
      </div>
      <div className="overflow-hidden mt-4">
        <motion.p 
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="text-sm tracking-[0.3em] text-gray-400 uppercase"
        >
          The Purest Form of Fruit
        </motion.p>
      </div>
    </motion.div>
  );
};

const Hero = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
  
  const rawY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  const y = useSpring(rawY, springConfig);
  const opacity = useSpring(rawOpacity, springConfig);

  const mouseX = useSpring(0, fastSpring);
  const mouseY = useSpring(0, fastSpring);
  const rotateX = useSpring(0, fastSpring);
  const rotateY = useSpring(0, fastSpring);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(normalizedX * 15);
    mouseY.set(normalizedY * 15);
    rotateX.set(normalizedY * -15);
    rotateY.set(normalizedX * 15);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  const floatingFruits = [
    { src: IMAGES.mango, top: '10%', left: '15%', scale: 0.6, blur: 8, parallax: -200, delay: 0 },
    { src: IMAGES.banana, top: '60%', left: '10%', scale: 0.8, blur: 4, parallax: -400, delay: 1 },
    { src: IMAGES.strawberry, top: '15%', right: '15%', scale: 0.5, blur: 10, parallax: -150, delay: 0.5 },
    { src: IMAGES.lemon, top: '70%', right: '12%', scale: 0.9, blur: 3, parallax: -500, delay: 1.5 },
    { src: IMAGES.pineapple, top: '40%', right: '5%', scale: 0.4, blur: 12, parallax: -100, delay: 2 },
  ];

  return (
    <section 
      ref={targetRef} 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="h-screen w-full relative bg-[#F7F7F5] overflow-hidden flex flex-col items-center justify-center cursor-none"
    >
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(247,247,245,1)_100%)] z-0" />

      {/* Floating Out-of-Focus Fruits (Depth of Field) */}
      {floatingFruits.map((fruit, idx) => (
        <motion.div
          key={idx}
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [0, fruit.parallax]),
            opacity 
          }}
          className="absolute z-0 pointer-events-none"
          initial={{ top: fruit.top, left: fruit.left, right: fruit.right }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img 
            animate={{ 
              y: [-20, 20, -20],
              rotate: [-5, 5, -5]
            }}
            transition={{ duration: 8 + idx, repeat: Infinity, ease: "easeInOut", delay: fruit.delay }}
            src={fruit.src} 
            alt="Floating fruit"
            className="object-contain"
            style={{ 
              transform: `scale(${fruit.scale})`,
              filter: `blur(${fruit.blur}px)`,
              opacity: 0.7,
              mixBlendMode: 'multiply'
            }}
          />
        </motion.div>
      ))}

      {/* Huge Typography interacting with Scroll */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
      >
        <motion.div 
          style={{ x: useTransform(scrollYProgress, [0, 1], [0, -400]) }}
          className="overflow-hidden"
        >
          <h1 className="text-[14vw] leading-[0.8] font-black text-[#E2E2D9] tracking-tighter mix-blend-multiply">
            NATURE.
          </h1>
        </motion.div>
        <motion.div 
          style={{ x: useTransform(scrollYProgress, [0, 1], [0, 400]) }}
          className="overflow-hidden ml-[10vw]"
        >
          <h1 className="text-[14vw] leading-[0.8] font-black text-[#E2E2D9] tracking-tighter mix-blend-multiply">
            PRESERVED.
          </h1>
        </motion.div>
      </motion.div>

      {/* Main Subject with Cinematic 3D */}
      <motion.div 
        style={{ opacity }}
        className="z-20 relative w-[90vw] max-w-[900px] h-[80vh] perspective-[1200px]"
      >
        <motion.div
          style={{ x: mouseX, y: mouseY, rotateX, rotateY }}
          className="w-full h-full preserve-3d flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img 
            initial={{ scale: 1.2, filter: "blur(20px)", opacity: 0, y: 50 }}
            animate={{ scale: 1, filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            src={IMAGES.mainHero} 
            alt="Hero Pouch" 
            className="w-full h-full object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.25)]"
            draggable="false"
          />
        </motion.div>

        {/* Premium Floating Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, delay: 1, ease: "backOut" }}
          className="absolute top-10 -right-12 md:-right-24 z-30"
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#111] text-white flex items-center justify-center shadow-2xl">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border border-white/20 rounded-full border-dashed"
            />
            <div className="text-center font-black leading-none">
              <span className="block text-3xl md:text-4xl">100%</span>
              <span className="block text-[0.6rem] md:text-xs tracking-[0.3em] uppercase text-amber-200 mt-1">Real Fruit</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Modern Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-30"
      >
        <span className="text-[0.65rem] font-bold tracking-[0.4em] uppercase text-black/40">Scroll to Explore</span>
        <div className="w-[1px] h-16 bg-black/10 relative overflow-hidden">
          <motion.div 
            animate={{ y: ["-100%", "100%"] }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-black"
          />
        </div>
      </motion.div>
    </section>
  );
};

const StoryProcess = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const rawX = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);
  const x = useSpring(rawX, springConfig);

  const sections = [
    {
      title: "100% REAL.",
      desc: "We start with farm-fresh, premium quality fruits. Nothing else.",
      titleColor: "text-white",
      descColor: "text-gray-300",
      bgClass: "bg-[#0a0a0a]",
    },
    {
      title: "RAPID FREEZE.",
      desc: "Temperatures drop instantly. Locking in the structural integrity and preventing cell damage.",
      titleColor: "text-blue-900",
      descColor: "text-blue-800/70",
      bgClass: "bg-blue-50",
    },
    {
      title: "VACUUM DRY.",
      desc: "Moisture is extracted gently. The pure, authentic flavor intensifies.",
      titleColor: "text-[#111]",
      descColor: "text-gray-600",
      bgClass: "bg-gray-200",
    },
    {
      title: "THE CRUNCH.",
      desc: "All the nutrients. Zero sugar added. Just crunchy perfection ready for you.",
      titleColor: "text-amber-900",
      descColor: "text-amber-800/80",
      bgClass: "bg-amber-100",
    }
  ];

  return (
    <section ref={targetRef} className="h-[400vh] relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <motion.div style={{ x }} className="flex h-full w-[400vw]">
          {sections.map((section, index) => {
            const textX = useTransform(scrollYProgress, 
              [Math.max(0, (index - 1) * 0.25), index * 0.25, Math.min(1, (index + 1) * 0.25)], 
              [200, 0, -200]
            );

            return (
              <div 
                key={index} 
                className={`w-screen h-full flex flex-col items-center justify-center px-8 relative overflow-hidden ${section.bgClass}`}
              >
                <motion.div 
                  className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none"
                  style={{ x: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
                >
                  <h2 className={`text-[40vw] font-black tracking-tighter uppercase whitespace-nowrap ${section.titleColor}`}>
                    {section.title.split(' ')[0]}
                  </h2>
                </motion.div>

                <motion.div 
                  style={{ x: textX }}
                  className="flex flex-col items-center max-w-4xl mx-auto z-10"
                >
                  <h2 className={`text-6xl md:text-[8vw] font-black tracking-tighter mb-8 leading-none uppercase text-center ${section.titleColor}`}>
                    {section.title}
                  </h2>
                  <p className={`text-xl md:text-3xl font-light text-center leading-relaxed ${section.descColor}`}>
                    {section.desc}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

const InteractivePouch = ({ src, alt, isDark }: { src: string, alt: string, isDark?: boolean }) => {
  const x = useSpring(0, fastSpring);
  const y = useSpring(0, fastSpring);
  const rotateX = useSpring(0, fastSpring);
  const rotateY = useSpring(0, fastSpring);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);

    x.set(normalizedX * 20);
    y.set(normalizedY * 20);
    rotateX.set(normalizedY * -10);
    rotateY.set(normalizedX * 10);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full cursor-none"
    >
      <motion.div
        style={{ x, y, rotateX, rotateY }}
        className="w-full h-full preserve-3d"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.2)]"
          style={{ mixBlendMode: isDark ? 'normal' : 'multiply' }}
          draggable="false"
        />
      </motion.div>
    </motion.div>
  );
};

const HorizontalProductShowcase = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  
  const rawX = useTransform(scrollYProgress, [0, 1], ["0%", `-${(PRODUCTS.length - 1) * 100}vw`]);
  const x = useSpring(rawX, springConfig);

  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <section ref={targetRef} className="h-[600vh] relative bg-[#EFEFE9]">
      <div className="fixed bottom-0 left-0 w-full h-1 z-50 mix-blend-difference bg-white/20">
        <motion.div style={{ scaleX, transformOrigin: "left" }} className="h-full bg-white w-full" />
      </div>

      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <motion.div style={{ x }} className="flex h-full w-[600vw]">
          {PRODUCTS.map((product, index) => {
            const textX = useTransform(scrollYProgress, 
              [index / PRODUCTS.length, (index + 1) / PRODUCTS.length], 
              [100, -100]
            );

            return (
              <div 
                key={product.id} 
                className="w-screen h-full flex flex-col md:flex-row items-center justify-center relative px-8 md:px-24 overflow-hidden"
                style={{ backgroundColor: product.color }}
              >
                <motion.div 
                  style={{ x: textX }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 whitespace-nowrap"
                >
                  <h2 
                    className="text-[30vw] font-black tracking-tighter uppercase"
                    style={{ color: product.darkColor }}
                  >
                    {product.name}
                  </h2>
                </motion.div>

                <div className="w-full md:w-5/12 z-10 flex flex-col justify-center text-left pt-24 md:pt-0 pl-0 md:pl-12">
                  <div className="overflow-hidden mb-6">
                    <motion.span 
                      initial={{ opacity: 0, y: "100%" }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, margin: "-100px" }}
                      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                      className="text-xs font-bold tracking-[0.3em] uppercase block"
                      style={{ color: product.darkColor }}
                    >
                      Signature Collection
                    </motion.span>
                  </div>
                  
                  <div className="overflow-hidden mb-6">
                    <motion.h3 
                      initial={{ y: "100%" }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: false, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
                      className={`text-6xl md:text-[7vw] font-black tracking-tighter leading-[0.85] uppercase ${product.isDark ? 'text-white' : 'text-[#111]'}`}
                    >
                      {product.name}
                    </motion.h3>
                  </div>

                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`text-xl md:text-2xl font-light max-w-md mb-12 ${product.isDark ? 'text-gray-300' : 'text-gray-800'}`}
                  >
                    {product.desc}
                  </motion.p>
                  
                  <Link href={`/products/${product.id}`}>
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className={`w-max px-10 py-5 rounded-full text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-4 hover:scale-105 transition-all duration-300 ${product.isDark ? 'bg-white text-black' : 'bg-[#111] text-white'}`}
                    >
                      View Details <ArrowRight size={16} />
                    </motion.button>
                  </Link>
                </div>

                <div className="w-full md:w-7/12 h-full relative z-10 flex items-center justify-center mt-10 md:mt-0 pb-20 md:pb-0">
                  <InteractivePouch src={product.image} alt={product.name} isDark={product.isDark} />
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

const EcommerceGrid = () => {
  return (
    <section className="py-40 px-8 md:px-24 bg-[#EFEFE9] text-[#111] rounded-t-[3rem] -mt-12 relative z-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div>
            <h2 className="text-6xl md:text-[6vw] font-black tracking-tighter mb-6 leading-[0.9] uppercase">The<br />Collection</h2>
          </div>
          <Link href="/products" className="border-b-2 border-black pb-1 font-bold tracking-[0.2em] uppercase text-sm flex items-center gap-3 hover:gap-6 transition-all duration-300">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {PRODUCTS.slice(0, 6).map((product, i) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer flex flex-col"
              >
                <div 
                  className="w-full aspect-[4/5] mb-8 relative overflow-hidden flex items-center justify-center p-12 transition-transform duration-700 ease-out group-hover:scale-[0.96]"
                  style={{ backgroundColor: product.color }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    style={{ mixBlendMode: product.isDark ? 'normal' : 'multiply' }}
                  />
                  
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="flex justify-between items-start border-t border-black/10 pt-6">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">{product.name}</h3>
                    <p className="text-gray-500 text-xs tracking-widest uppercase">Freeze Dried • 20g</p>
                  </div>
                  <span className="text-xl font-medium tracking-tight">${product.price}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <main>
            <Hero />
            <StoryProcess />
            <HorizontalProductShowcase />
            <EcommerceGrid />
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  );
}
