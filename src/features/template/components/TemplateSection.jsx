import React from "react";
import { useNavigate } from "react-router-dom";
import { useCV } from "../../../context/CVContext";
import SectionHeader from "../../landing/components/SectionHeader";
import { Button, Reveal } from "../../../shared/ui/UIComponents";
import TemplateCard from "./TemplateCard";
import { getTemplateById } from "../../../utils/helper";
import { TEMPLATES } from "../../../data/templates";

import { FaLayerGroup, FaTableCellsLarge } from "react-icons/fa6";

function TemplateSection() {
    const navigate = useNavigate();
    const { newCV, cvData } = useCV();

    const selectTpl = (id) => {
        const tpl = getTemplateById(id, TEMPLATES);
        cvData.design = cvData.design || {};
        cvData.design.layout = tpl.layout || "single";
        cvData.design.template = tpl.id;
        cvData.design.primaryColor = tpl.colors?.[0] || "#4f46e5";
        navigate("/editor");
    };

    const templatesToShow = TEMPLATES.slice(0, 4);

    return (
        <section id="templates" className="py-20 lg:py-28 bg-[var(--surface-50)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <SectionHeader
                    badge="Templates"
                    badgeIcon={FaLayerGroup}
                    title="Premium CV Templates"
                    subtitle="Start with a stunning template and make it your own"
                />

                {/* Template Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
                    {templatesToShow.map((t, i) => (
                        <Reveal key={t.id} direction="up" delay={i * 0.1}>
                            <TemplateCard
                                template={t}
                                onClick={() => selectTpl(t.id)}
                            />
                        </Reveal>
                    ))}
                </div>

                {/* View All Button */}
                <Reveal className="text-center mt-10">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate("/templates")}
                    >
                        <FaTableCellsLarge className="mr-2" /> View All Templates
                    </Button>
                </Reveal>

            </div>
        </section>
    );
}

export default TemplateSection;