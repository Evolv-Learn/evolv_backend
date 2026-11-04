# Practical Data Engineering for Beginners — Course Proposal
**EvolvLearn | For Internal Review**

---

## Purpose of This Document

This document outlines the proposed structure for a new EvolvLearn course: **Practical Data Engineering for Beginners (Azure Track)**. It is shared with the teaching team and colleagues for review, feedback, and input before the course is finalised and published.

Please review the structure, weekly breakdown, and open questions at the end and add your comments.

---

## Course Overview

| Detail | Value |
|---|---|
| **Course Title** | Practical Data Engineering for Beginners |
| **Track** | Azure (AWS track to be considered for future cohort) |
| **Duration** | 12 weeks (3 months) |
| **Workload** | 6 hours per week |
| **Total Hours** | 72 hours |
| **Format** | Live on Discord (same delivery model as R for Quantitative Research) |
| **Prerequisites** | None required. Prior Python or SQL knowledge is a plus, but the course starts from zero. |
| **Target Audience** | Beginners with no data engineering background — students, early-career professionals, career switchers |

---

## Course Goal

By the end of this course, a student should be able to:

- Understand the role of a data engineer and the modern data stack
- Write Python and SQL at a level sufficient for data engineering tasks
- Build a batch data pipeline on Azure using real cloud tools
- Store, transform, and model data in a cloud warehouse
- Automate, monitor, and deliver data to Power BI
- Complete and present a working end-to-end data project

---

## Proposed 12-Week Structure (Azure Track)

### Block 1 — Foundations (Weeks 1–3)

> Goal: Ensure every student has the minimum tools to follow the rest of the course.

| Week | Topic | Key Activities |
|---|---|---|
| 1 | Python for data engineering | Data types, functions, file I/O, working with pandas, reading/writing CSV and JSON |
| 2 | SQL for data engineering | SELECT, WHERE, JOIN, GROUP BY, window functions, writing queries against a local database |
| 3 | Git, command line, and data formats | Git basics (clone, commit, push), command line navigation, CSV vs JSON vs Parquet vs Avro |

---

### Block 2 — Databases & Data Modelling (Weeks 4–5)

> Goal: Understand how data is structured before moving it to the cloud.

| Week | Topic | Key Activities |
|---|---|---|
| 4 | Relational databases and local practice | PostgreSQL setup, creating tables, inserting and querying data locally |
| 5 | Data modelling | Star schema, fact and dimension tables, designing a simple data model for the course project |

---

### Block 3 — Cloud Storage & Transformations (Weeks 6–7)

> Goal: Move data to Azure and transform it into something useful.

| Week | Topic | Key Activities |
|---|---|---|
| 6 | Azure cloud storage | Azure Blob Storage, containers, permissions, credential safety (no hardcoded keys), Azure portal navigation |
| 7 | SQL transformations with dbt | dbt setup, writing models, running tests, documentation, connecting dbt to Azure Synapse |

---

### Block 4 — ETL & Ingestion (Week 8)

> Goal: Build a real pipeline that moves data from a source into the warehouse.

| Week | Topic | Key Activities |
|---|---|---|
| 8 | Batch ingestion with Azure Data Factory | Pipeline concepts, linked services, datasets, triggers, moving data from Blob Storage to Synapse |

---

### Block 5 — Automation & Monitoring (Weeks 9–10)

> Goal: Make the pipeline production-ready and visible.

| Week | Topic | Key Activities |
|---|---|---|
| 9 | Automation — stored procedures and triggers | SQL stored procedures, Azure Data Factory triggers, scheduled runs, error handling |
| 10 | Monitoring and Power BI connection | Azure Monitor, pipeline alerts, connecting Power BI to Synapse (DirectQuery vs Import), building a simple dashboard |

---

### Block 6 — Capstone Project (Weeks 11–12)

> Goal: Apply everything end-to-end and present a working project.

| Week | Topic | Key Activities |
|---|---|---|
| 11 | Capstone build | Student builds a full pipeline: ingest → store → transform → automate → visualise. Instructor support sessions. |
| 12 | Capstone demonstrations and code review | Each student presents their project. Live feedback from instructors. Cost review of Azure resources used. |

---

## Course Project (Runs Throughout)

Students will work on a single project from Week 2 onwards, progressively building it as they learn each block. The project brief will be defined before the course starts and should use a publicly available dataset relevant to the cohort's interests (e.g. agricultural data, health data, economic indicators).

By Week 12, each student will have a GitHub repository containing:
- Python ingestion scripts
- dbt transformation models
- Azure Data Factory pipeline (exported as JSON)
- A Power BI dashboard connected to their warehouse
- A README documenting their architecture

---

## Tools & Services Used

| Tool | Purpose |
|---|---|
| Python (pandas, requests) | Ingestion scripts |
| SQL / PostgreSQL | Local database practice |
| Git / GitHub | Version control |
| Azure Blob Storage | Raw data lake |
| Azure Synapse Analytics | Cloud data warehouse |
| Azure Data Factory | Pipeline orchestration |
| Azure Monitor | Alerting and monitoring |
| dbt (data build tool) | SQL transformations |
| Power BI | Data visualisation and delivery |

---

## Open Questions for Team Review

Please add your input against each question:

1. **Week 1–3 pace** — Is 3 weeks sufficient for a true zero-to-start student to be comfortable with Python, SQL, Git, and data formats? Should any week be split further?

2. **Azure tools** — Are there Azure services in the proposed stack that should be replaced or added? (e.g. Azure Databricks instead of Synapse?)

3. **dbt placement** — Week 7 introduces dbt after cloud storage but before ETL. Does this order feel right, or should dbt come after students have ingested real data?

4. **Power BI licensing** — Power BI Desktop is free. Do we expect students to have access to Power BI Service (requires Microsoft 365)? Should we offer an alternative (e.g. Metabase)?

5. **Cost management** — Azure free tier limits will be hit by some exercises. Do we provide credits, or guide students through cost-aware usage? Should a cost review session be added earlier than Week 12?

6. **Capstone dataset** — What dataset should we use for the course project? Suggestions welcome.

7. **Anything missing?** — Are there topics, tools, or skills you would add or remove from the current structure?

---

## Next Steps

- [ ] Team reviews this document and adds comments by agreed date
- [ ] Finalise weekly structure based on feedback
- [ ] Define capstone project brief and dataset
- [ ] Build course page on EvolvLearn platform
- [ ] Set cohort start date and open applications

---

*Prepared by the EvolvLearn curriculum team. For internal review only.*
