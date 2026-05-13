import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyHelps from "@/components/WhyHelps";
import BeforeTrading from "@/components/BeforeTrading";
import AboutCoach from "@/components/AboutCoach";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <WhyHelps />
            <BeforeTrading />
            <AboutCoach />
            <CtaSection />
            <Footer />
        </>
    );
}
