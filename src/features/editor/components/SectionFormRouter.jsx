import PersonalForm from "../forms/PersonalForm";
import SummaryForm from "../forms/SummaryForm";
import ExperienceForm from "../forms/ExperienceForm";
import EducationForm from "../forms/EducationForm";
import SkillsForm from "../forms/SkillsForm";
import ProjectsForm from "../forms/ProjectsForm";
import CertificationsForm from "../forms//CertificationsForm";
import LanguagesForm from "../forms/LanguagesForm";
import AwardsForm from "../forms/AwardsForm";
import HobbiesForm from "../forms/HobbiesForm";
import ReferencesForm from "../forms/ReferencesForm";

function SectionFormRouter({ section }) {
  const formMap = {
    personal: PersonalForm,
    summary: SummaryForm,
    experience: ExperienceForm,
    education: EducationForm,
    skills: SkillsForm,
    projects: ProjectsForm,
    certifications: CertificationsForm,
    languages: LanguagesForm,
    awards: AwardsForm,
    hobbies: HobbiesForm,
    references: ReferencesForm,
  };

  const FormComp = formMap[section];

  return FormComp ? (
    <FormComp />
  ) : (
    <p className="text-sm text-surface-400">
      Form not available.
    </p>
  );
}

export default SectionFormRouter;