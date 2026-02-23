import React, { useEffect } from 'react'
import Navbar from '../../../shared/layout/Navbar'
import HeroSection from '../components/HeroSection'
import { useNavigate } from 'react-router-dom';
import StatsSection from '../components/StatsSection';
import HowItWorksSection from '../components/HowItWorks';
import FeaturesSection from '../components/FeatureSection';
import AIAnalyzerSection from '../components/AIAnalyzerSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CustomizationSection from '../components/CustomizationSection';
import Footer from '../../../shared/layout/Footer';
import TemplateSection from '../../template/components/TemplateSection';

const Landingpage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div>
            <Navbar navigate={navigate} />
            <HeroSection navigate={navigate} />
            <StatsSection />
            <HowItWorksSection />
            <FeaturesSection />
            <AIAnalyzerSection />
            <TemplateSection />
            <CustomizationSection />
            <TestimonialsSection />
            <Footer />
        </div>
    )
}

export default Landingpage;