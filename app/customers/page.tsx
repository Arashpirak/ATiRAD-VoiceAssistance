"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Define customer type with a strict position tuple
interface Customer {
  name: string;
  website: string;
  position: [number, number, number]; // Tuple for Vector3
  color: string;
  logo: string;
}

// Customer data with their websites and 3D positions
const customerData: Customer[] = [
  {
    name: "TechCorp",
    website: "https://techcorp.example.com",
    position: [2, 1, -5],
    color: "#01ADEF",
    logo: "TC",
  },
  {
    name: "HealthPlus",
    website: "https://healthplus.example.com",
    position: [-3, 2, -8],
    color: "#ffffff",
    logo: "H+",
  },
  {
    name: "EduLearn",
    website: "https://edulearn.example.com",
    position: [4, -1, -12],
    color: "#01ADEF",
    logo: "EL",
  },
  {
    name: "ShopMart",
    website: "https://shopmart.example.com",
    position: [-2, -2, -6],
    color: "#ffffff",
    logo: "SM",
  },
  {
    name: "FinanceHub",
    website: "https://financehub.example.com",
    position: [1, 3, -15],
    color: "#01ADEF",
    logo: "FH",
  },
  {
    name: "TravelGo",
    website: "https://travelgo.example.com",
    position: [-4, 0, -10],
    color: "#ffffff",
    logo: "TG",
  },
  {
    name: "FoodieApp",
    website: "https://foodieapp.example.com",
    position: [3, 2, -7],
    color: "#01ADEF",
    logo: "FA",
  },
  {
    name: "FitTracker",
    website: "https://fittracker.example.com",
    position: [-1, -3, -9],
    color: "#ffffff",
    logo: "FT",
  },
];

function CustomerIcon({ customer }: { customer: Customer }) {
  const handleClick = () => {
    window.open(customer.website, "_blank");
  };

  return (
    <Html position={customer.position} center>
      <div onClick={handleClick} className="flex flex-col items-center cursor-pointer group">
        <div
          className="flex items-center justify-center w-20 h-20 rounded-full backdrop-blur-sm border-2 border-white/20 hover:scale-110 transition-all duration-300 group-hover:border-white/40"
          style={{
            backgroundColor: customer.color === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(1,173,239,0.2)",
            boxShadow: `0 0 30px ${customer.color}40`,
          }}
        >
          <span className="text-2xl font-bold" style={{ color: customer.color }}>
            {customer.logo}
          </span>
        </div>
        <div className="mt-2 text-center">
          <p className="text-white text-sm font-medium">{customer.name}</p>
          <div className="flex items-center gap-1 text-xs text-white/60 group-hover:text-white/80 transition-colors">
            <ExternalLink size={12} />
            <span>Visit Site</span>
          </div>
        </div>
      </div>
    </Html>
  );
}

function Scene() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Customer icons */}
      {customerData.map((customer, index) => (
        <CustomerIcon key={index} customer={customer} />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        autoRotate={true}
        autoRotateSpeed={0.3}
      />
    </>
  );
}

export default function CustomersShowcase() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#08075C] via-[#01ADEF] to-white overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0, 0],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Assistant
          </Button>
        </Link>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white border border-white/20">
          <h1 className="text-2xl font-bold mb-2">Our Customers</h1>
          <p className="text-sm opacity-80">Click on any logo to visit their website</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white text-sm border border-white/20">
          <p>Drag to explore • Scroll to zoom • Click logos to visit sites</p>
        </div>
      </div>
    </div>
  );
}