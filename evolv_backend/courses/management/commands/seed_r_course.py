from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import date
from courses.models import Course, Location, LearningSchedule, Module, Lesson

User = get_user_model()


MODULES = [
    {
        "title": "Module 1 — Git & Version Control for Researchers",
        "description": "Set up Git, create repositories, and manage your R project files with version control from day one.",
        "order": 1,
        "lessons": [
            ("What is version control and why researchers need it", "Understanding Git concepts: commits, branches, and history"),
            ("Installing Git and connecting to GitHub", "Step-by-step setup on Windows, Mac, and Linux"),
            ("Creating your first repository for an R project", "Initialising a repo, .gitignore for R, first commit"),
            ("Committing, pushing, and pulling changes", "Daily workflow: add, commit, push, pull"),
            ("Exercise: Set up your research project repo", "Practical: create a repo for your own dataset"),
        ],
    },
    {
        "title": "Module 2 — Introduction to R and RStudio",
        "description": "Get comfortable with the R environment, basic syntax, data types, and writing your first scripts.",
        "order": 2,
        "lessons": [
            ("Installing R and RStudio", "Download, install, and configure the RStudio IDE"),
            ("R syntax fundamentals: variables, vectors, and operators", "Objects, assignment, arithmetic, and logical operators"),
            ("Data types in R: numeric, character, logical, factor", "Understanding how R handles different kinds of data"),
            ("Writing and running your first R script", "Script vs console, comments, running code"),
            ("Packages: installing and loading tidyverse", "CRAN, install.packages(), library()"),
            ("Exercise: Explore a simple agricultural dataset in R", "Load a CSV and perform basic exploration"),
        ],
    },
    {
        "title": "Module 3 — Data Import and Inspection",
        "description": "Read data into R from CSV, Excel, and other common formats used in research.",
        "order": 3,
        "lessons": [
            ("Importing CSV and Excel files with readr and readxl", "read_csv(), read_excel(), common pitfalls"),
            ("Inspecting your data: str(), summary(), head()", "First steps after loading any dataset"),
            ("Handling missing values (NA)", "Detecting, counting, and dealing with NAs"),
            ("Dealing with messy column names and data types", "janitor::clean_names(), as.numeric(), as.factor()"),
            ("Exercise: Import and inspect your own field data", "Practical with student's real or provided dataset"),
        ],
    },
    {
        "title": "Module 4 — Data Wrangling with dplyr",
        "description": "Transform, filter, summarise, and reshape your data using the most important R package for data manipulation.",
        "order": 4,
        "lessons": [
            ("Filtering rows with filter()", "Subsetting data by condition"),
            ("Selecting and renaming columns with select() and rename()", "Working with specific variables"),
            ("Creating new variables with mutate()", "Calculated columns, unit conversions, transformations"),
            ("Summarising data with summarise() and group_by()", "Group means, totals, counts — the backbone of data analysis"),
            ("Joining datasets with left_join() and inner_join()", "Combining treatment data with measurement data"),
            ("Exercise: Clean and summarise a crop yield dataset", "End-to-end wrangling on a realistic agricultural dataset"),
        ],
    },
    {
        "title": "Module 5 — Data Visualisation with ggplot2",
        "description": "Create publication-quality plots for your research using the grammar of graphics.",
        "order": 5,
        "lessons": [
            ("The grammar of graphics: data, aesthetics, geoms", "How ggplot2 thinks about visualisation"),
            ("Bar charts and column plots for treatment comparisons", "geom_bar(), geom_col(), coord_flip()"),
            ("Boxplots and violin plots for distributions", "Showing variability in experimental results"),
            ("Scatter plots and line graphs for trends", "geom_point(), geom_line(), geom_smooth()"),
            ("Faceting: small multiples with facet_wrap()", "Comparing across locations, years, or treatments"),
            ("Customising themes, colours, and labels for publication", "theme_classic(), scale_fill_manual(), labs()"),
            ("Exercise: Visualise your experimental results", "Create three publication-ready plots from your data"),
        ],
    },
    {
        "title": "Module 6 — Introduction to Statistics in R",
        "description": "Understand and apply foundational statistical tests used in quantitative research.",
        "order": 6,
        "lessons": [
            ("Descriptive statistics: mean, variance, standard deviation", "Summarising your data numerically"),
            ("Hypothesis testing: t-test and Wilcoxon test", "Comparing two groups — when to use which test"),
            ("Correlation: Pearson and Spearman", "Measuring relationships between variables"),
            ("Simple linear regression", "Modelling one variable as a function of another"),
            ("Interpreting p-values and confidence intervals", "What the numbers actually mean in research"),
            ("Exercise: Test a hypothesis from your own data", "Apply a t-test or correlation to your dataset"),
        ],
    },
    {
        "title": "Module 7 — Advanced Statistical Analysis",
        "description": "Go deeper with ANOVA, multiple regression, and non-parametric alternatives for complex research data.",
        "order": 7,
        "lessons": [
            ("One-way ANOVA and post-hoc tests (Tukey HSD)", "Comparing three or more treatment groups"),
            ("Two-way ANOVA with interaction effects", "Analysing treatments across multiple factors"),
            ("Multiple linear regression", "Modelling outcomes with several predictors"),
            ("Model diagnostics: checking assumptions", "Residuals, normality, homoscedasticity"),
            ("Non-parametric alternatives: Kruskal-Wallis, Mann-Whitney", "When your data does not meet parametric assumptions"),
            ("Exercise: Run a full ANOVA on your experimental data", "From model to interpretation to publication table"),
        ],
    },
    {
        "title": "Module 8 — Experimental Designs: CRD and RCBD",
        "description": "Analyse the two most common field experimental designs using R and the agricolae package.",
        "order": 8,
        "lessons": [
            ("What is a designed experiment? CRD vs RCBD", "Understanding replication, randomisation, and blocking"),
            ("Analysing a Completely Randomised Design (CRD) in R", "aov(), summary(), model interpretation"),
            ("Analysing a Randomised Complete Block Design (RCBD)", "Adding blocks to control for field variation"),
            ("Mean separation with LSD and Tukey tests", "Which treatments are significantly different?"),
            ("Presenting ANOVA results: tables and letter displays", "Making results readable for a paper or thesis"),
            ("Exercise: Analyse your field trial data as CRD or RCBD", "Full analysis with interpretation"),
        ],
    },
    {
        "title": "Module 9 — Advanced Designs: Split-Plot and Mixed Models",
        "description": "Handle more complex experimental structures with split-plot designs and linear mixed models.",
        "order": 9,
        "lessons": [
            ("Split-plot designs: structure and rationale", "When and why split-plot is used in field research"),
            ("Analysing split-plot experiments in R", "Using lme4 or agricolae for split-plot ANOVA"),
            ("Introduction to linear mixed models with lme4", "Fixed effects, random effects, and when they matter"),
            ("Repeated measures analysis", "Handling observations over time on the same experimental unit"),
            ("Model comparison and selection with AIC", "Choosing the right model for your data"),
            ("Exercise: Analyse a split-plot or repeated measures dataset", "Practical with a realistic multi-factor dataset"),
        ],
    },
    {
        "title": "Module 10 — Audience-Specific Applications",
        "description": "Apply R to specialised research contexts: agronomy, plant breeding/METs, and biological/engineering sciences.",
        "order": 10,
        "lessons": [
            ("Track A — Agronomy: yield stability analysis with GGE biplot", "Analysing genotype × environment interaction"),
            ("Track A — Agronomy: soil data analysis and mapping basics", "Working with soil fertility and pH data"),
            ("Track B — Plant Breeding: BLUP and BLUEs with lme4", "Estimating breeding values from trial data"),
            ("Track B — Plant Breeding: Multi-Environment Trial (MET) analysis", "Stability, adaptability, and GxE decomposition"),
            ("Track C — Biological/Engineering: dose-response and regression models", "Fitting curves and non-linear models to experimental data"),
            ("Exercise: Work through the track relevant to your research", "Choose your track and complete the analysis exercise"),
        ],
    },
    {
        "title": "Module 11 — Reproducible Research with R Markdown and Quarto",
        "description": "Write your thesis chapters, research reports, and papers directly in R — combining code, results, and text in one document.",
        "order": 11,
        "lessons": [
            ("What is reproducible research and why it matters", "The crisis in science and how R Markdown helps"),
            ("Your first R Markdown document", "YAML header, code chunks, inline results"),
            ("Formatting text, headers, and lists in R Markdown", "Markdown syntax for academic writing"),
            ("Generating publication-quality tables with knitr and kableExtra", "Formatted tables directly from your analysis"),
            ("Introduction to Quarto: the next generation", "How Quarto improves on R Markdown for modern research"),
            ("Exercise: Write a reproducible mini-report of your analysis", "Combine your Module 8/9 results into a formatted report"),
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with the R for Quantitative Research course and full curriculum"

    def handle(self, *args, **options):
        # ── Instructor ────────────────────────────────────────────────────────
        instructor = User.objects.filter(is_superuser=True).first()
        if not instructor:
            self.stdout.write(self.style.ERROR("No superuser found. Create one first with: python manage.py createsuperuser"))
            return

        # ── Location ─────────────────────────────────────────────────────────
        location, _ = Location.objects.get_or_create(
            name="Online — Discord",
            defaults={
                "location_type": "Online",
                "online_region": "Nigeria",
            },
        )
        self.stdout.write(f"  Location: {location}")

        # ── Course ────────────────────────────────────────────────────────────
        course, created = Course.objects.get_or_create(
            name="R for Quantitative Research",
            defaults={
                "category": "Quantitative Methods",
                "description": (
                    "A structured, hands-on training programme for researchers, students, and scientists "
                    "who work with quantitative data. Covers R programming from the ground up through to "
                    "advanced experimental designs used in agricultural, biological, and environmental sciences. "
                    "Every session is taught live on Discord by Moshood Owolabi."
                ),
                "software_tools": "R, RStudio, tidyverse (dplyr, ggplot2, readr), agricolae, lme4, R Markdown, Quarto, Git, GitHub",
                "topics_covered": (
                    "Version control with Git\n"
                    "R programming fundamentals\n"
                    "Data import and cleaning\n"
                    "Data wrangling with dplyr\n"
                    "Data visualisation with ggplot2\n"
                    "Descriptive and inferential statistics\n"
                    "ANOVA and post-hoc tests\n"
                    "CRD and RCBD experimental designs\n"
                    "Split-plot and mixed models\n"
                    "Audience-specific applications (Agronomy, Plant Breeding, Engineering)\n"
                    "Reproducible research with R Markdown and Quarto"
                ),
                "instructor": instructor,
                "registration_deadline": date(2026, 7, 15),
                "selection_date": date(2026, 7, 22),
                "start_date": date(2026, 8, 4),
                "end_date": date(2026, 11, 4),
            },
        )
        course.locations.add(location)
        action = "Created" if created else "Already exists"
        self.stdout.write(f"  Course: {action} — {course}")

        # ── Learning Schedule (Cohort 3) ───────────────────────────────────────
        schedule, _ = LearningSchedule.objects.get_or_create(
            course=course,
            location=location,
            start_date=date(2026, 8, 4),
            defaults={
                "end_date": date(2026, 11, 4),
                "instructor": instructor,
            },
        )
        self.stdout.write(f"  Schedule: {schedule}")

        # ── Modules and Lessons ───────────────────────────────────────────────
        for mod_data in MODULES:
            module, mod_created = Module.objects.get_or_create(
                schedule=schedule,
                order=mod_data["order"],
                defaults={
                    "title": mod_data["title"],
                    "description": mod_data["description"],
                },
            )
            mod_action = "+" if mod_created else "~"
            self.stdout.write(f"    {mod_action} {module.title}")

            for i, (title, description) in enumerate(mod_data["lessons"], start=1):
                lesson, les_created = Lesson.objects.get_or_create(
                    module=module,
                    order=i,
                    defaults={"title": title, "description": description},
                )
                if les_created:
                    self.stdout.write(f"        + Lesson {i}: {title}")

        self.stdout.write(self.style.SUCCESS(
            "\nDone. R for Quantitative Research course is ready.\n"
            f"  Course ID : {course.pk}\n"
            f"  Curriculum: http://127.0.0.1:3000/courses/{course.pk}/\n"
            f"  Admin     : http://127.0.0.1:8000/admin/courses/course/{course.pk}/change/\n"
        ))
