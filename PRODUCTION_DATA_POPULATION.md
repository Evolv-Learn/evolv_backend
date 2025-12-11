# Production Database Population Guide

## Categories & Courses Data for Evolv Platform

This document provides structured data to populate the production database with realistic categories and courses based on Evolv's educational focus areas.

---

## 📊 CATEGORIES

### 1. Data for Research
**Target Audience**: Master's students, PhD candidates, researchers in science and social science fields
**Focus**: Teaching R programming for research applications

```json
{
  "name": "Data for Research",
  "description": "Master R programming for scientific and social science research. Learn statistical analysis, data visualization, and research methodologies tailored for academic and research environments.",
  "icon": "🔬",
  "color": "bg-gradient-to-br from-blue-600 to-indigo-700",
  "is_active": true,
  "order": 1
}
```

### 2. Data for Professionals
**Target Audience**: Job seekers, career changers, working professionals
**Focus**: Industry-ready data skills for employment

```json
{
  "name": "Data for Professionals",
  "description": "Launch your data career with industry-focused training. Master the skills needed for Data Analyst, Data Engineer, and Data Scientist roles in today's competitive job market.",
  "icon": "💼",
  "color": "bg-gradient-to-br from-emerald-600 to-teal-700",
  "is_active": true,
  "order": 2
}
```

### 3. Cybersecurity
**Target Audience**: IT professionals, security enthusiasts, career switchers
**Focus**: Comprehensive cybersecurity training

```json
{
  "name": "Cybersecurity",
  "description": "Protect digital assets and build a career in cybersecurity. Learn ethical hacking, network security, incident response, and compliance frameworks.",
  "icon": "🛡️",
  "color": "bg-gradient-to-br from-red-600 to-orange-700",
  "is_active": true,
  "order": 3
}
```

---

## 📚 COURSES

### Data for Research Category

#### Course 1: R for Science
```json
{
  "name": "R for Science",
  "category": "Data for Research",
  "description": "Master R programming for scientific research. Perfect for plant breeders, agronomists, biologists, and botanists working with quantitative data. Learn statistical analysis, experimental design, and data visualization techniques essential for scientific publications.",
  "software_tools": "R, RStudio, ggplot2, dplyr, tidyr, agricolae, genetics, plantbreeding",
  "topics_covered": "Introduction to R Programming\nDescriptive Statistics for Science\nExperimental Design and ANOVA\nRegression Analysis for Biological Data\nGenetic Data Analysis\nPlant Breeding Statistics\nData Visualization with ggplot2\nReproducible Research with R Markdown\nStatistical Modeling for Agriculture\nPublication-Ready Plots and Tables",
  "registration_deadline": "2025-02-15",
  "selection_date": "2025-02-20",
  "start_date": "2025-03-01",
  "end_date": "2025-05-30",
  "locations": ["Online", "Abuja", "Lagos"],
  "partners": ["International Institute of Tropical Agriculture (IITA)", "University of Agriculture Abeokuta"]
}
```

#### Course 2: R for Social Science
```json
{
  "name": "R for Social Science",
  "category": "Data for Research",
  "description": "Learn R programming for social science research with focus on agricultural extension and qualitative data analysis. Ideal for researchers in agricultural extension, rural development, and social sciences working with survey data and mixed-methods research.",
  "software_tools": "R, RStudio, tidyverse, psych, lavaan, survey, qualitative analysis packages",
  "topics_covered": "R Fundamentals for Social Scientists\nSurvey Data Analysis\nQualitative Data Coding in R\nMixed-Methods Research Analysis\nPsychometric Analysis\nStructural Equation Modeling\nSocial Network Analysis\nAgricultural Extension Impact Assessment\nCommunity-Based Research Methods\nPolicy Analysis with R",
  "registration_deadline": "2025-02-15",
  "selection_date": "2025-02-20",
  "start_date": "2025-03-15",
  "end_date": "2025-06-15",
  "locations": ["Online", "Ibadan", "Kaduna"],
  "partners": ["International Food Policy Research Institute (IFPRI)", "University of Ibadan"]
}
```

### Data for Professionals Category

#### Course 3: Data Analyst Professional Track
```json
{
  "name": "Data Analyst Professional Track",
  "category": "Data for Professionals",
  "description": "Launch your career as a Data Analyst with this comprehensive program. Learn industry-standard tools and techniques used by top companies. Includes real-world projects, portfolio development, and job placement support.",
  "software_tools": "Python, SQL, Excel, Tableau, Power BI, Pandas, NumPy, Matplotlib, Seaborn",
  "topics_covered": "Data Analysis Fundamentals\nSQL for Data Analysis\nPython Programming for Analysts\nData Cleaning and Preprocessing\nExploratory Data Analysis\nStatistical Analysis and Hypothesis Testing\nData Visualization Best Practices\nBusiness Intelligence with Tableau/Power BI\nA/B Testing and Experimentation\nPortfolio Project Development",
  "registration_deadline": "2025-01-31",
  "selection_date": "2025-02-05",
  "start_date": "2025-02-15",
  "end_date": "2025-06-15",
  "locations": ["Online", "Lagos", "Abuja", "Port Harcourt"],
  "partners": ["Microsoft Nigeria", "Andela", "Flutterwave"]
}
```

#### Course 4: Data Engineer Bootcamp
```json
{
  "name": "Data Engineer Bootcamp",
  "category": "Data for Professionals",
  "description": "Become a Data Engineer and build the infrastructure that powers data-driven organizations. Learn to design, build, and maintain scalable data pipelines and systems used by major tech companies.",
  "software_tools": "Python, SQL, Apache Spark, Kafka, Airflow, Docker, AWS, Azure, Hadoop, MongoDB",
  "topics_covered": "Data Engineering Fundamentals\nDatabase Design and Management\nETL/ELT Pipeline Development\nBig Data Technologies (Spark, Hadoop)\nCloud Data Platforms (AWS, Azure)\nReal-time Data Processing\nData Warehousing and Modeling\nContainerization with Docker\nWorkflow Orchestration with Airflow\nCapstone Project: End-to-End Data Pipeline",
  "registration_deadline": "2025-02-28",
  "selection_date": "2025-03-05",
  "start_date": "2025-03-15",
  "end_date": "2025-07-15",
  "locations": ["Online", "Lagos", "Abuja"],
  "partners": ["Amazon Web Services", "Microsoft Azure", "Interswitch"]
}
```

#### Course 5: Data Science Mastery Program
```json
{
  "name": "Data Science Mastery Program",
  "category": "Data for Professionals",
  "description": "Master the complete Data Science lifecycle from problem definition to model deployment. This intensive program combines statistics, machine learning, and business acumen to prepare you for senior Data Scientist roles.",
  "software_tools": "Python, R, SQL, Jupyter, TensorFlow, PyTorch, Scikit-learn, MLflow, Git, Docker",
  "topics_covered": "Statistics and Probability for Data Science\nMachine Learning Algorithms\nDeep Learning and Neural Networks\nNatural Language Processing\nComputer Vision\nTime Series Analysis\nModel Deployment and MLOps\nA/B Testing and Experimentation\nBusiness Strategy for Data Scientists\nCapstone Project: End-to-End ML Solution",
  "registration_deadline": "2025-03-15",
  "selection_date": "2025-03-20",
  "start_date": "2025-04-01",
  "end_date": "2025-09-30",
  "locations": ["Online", "Lagos", "Abuja", "Kano"],
  "partners": ["Google AI", "NVIDIA", "Paystack", "Jumia Technologies"]
}
```

### Cybersecurity Category

#### Course 6: Ethical Hacking & Penetration Testing
```json
{
  "name": "Ethical Hacking & Penetration Testing",
  "category": "Cybersecurity",
  "description": "Learn ethical hacking techniques to identify and fix security vulnerabilities. This hands-on course prepares you for CEH (Certified Ethical Hacker) certification and penetration testing roles in cybersecurity.",
  "software_tools": "Kali Linux, Metasploit, Nmap, Wireshark, Burp Suite, OWASP ZAP, Nessus, John the Ripper",
  "topics_covered": "Introduction to Ethical Hacking\nReconnaissance and Information Gathering\nScanning and Enumeration\nVulnerability Assessment\nSystem Hacking Techniques\nWeb Application Security Testing\nWireless Network Security\nSocial Engineering\nMalware Analysis Basics\nPenetration Testing Methodology",
  "registration_deadline": "2025-02-10",
  "selection_date": "2025-02-15",
  "start_date": "2025-03-01",
  "end_date": "2025-06-01",
  "locations": ["Online", "Lagos", "Abuja"],
  "partners": ["EC-Council", "Cybersecurity Nigeria", "MainOne"]
}
```

#### Course 7: Network Security & Infrastructure Protection
```json
{
  "name": "Network Security & Infrastructure Protection",
  "category": "Cybersecurity",
  "description": "Master network security fundamentals and advanced protection techniques. Learn to secure enterprise networks, implement firewalls, and respond to security incidents effectively.",
  "software_tools": "Cisco ASA, pfSense, Splunk, Nagios, OpenVAS, Snort, IPTables, Active Directory",
  "topics_covered": "Network Security Fundamentals\nFirewall Configuration and Management\nIntrusion Detection and Prevention\nVPN Implementation and Management\nNetwork Monitoring and Analysis\nIncident Response Procedures\nSecurity Information and Event Management (SIEM)\nActive Directory Security\nCompliance and Risk Management\nSecurity Architecture Design",
  "registration_deadline": "2025-03-01",
  "selection_date": "2025-03-05",
  "start_date": "2025-03-15",
  "end_date": "2025-06-15",
  "locations": ["Online", "Lagos", "Port Harcourt"],
  "partners": ["Cisco Systems", "CompTIA", "Nigerian Communications Commission"]
}
```

#### Course 8: Cloud Security & Compliance
```json
{
  "name": "Cloud Security & Compliance",
  "category": "Cybersecurity",
  "description": "Secure cloud environments and ensure compliance with industry standards. Learn AWS, Azure, and GCP security best practices while preparing for cloud security certifications.",
  "software_tools": "AWS Security Services, Azure Security Center, Google Cloud Security, Terraform, CloudFormation, Kubernetes",
  "topics_covered": "Cloud Security Fundamentals\nAWS Security Best Practices\nAzure Security Implementation\nGoogle Cloud Platform Security\nIdentity and Access Management (IAM)\nData Encryption and Key Management\nCompliance Frameworks (SOC 2, ISO 27001)\nContainer Security\nServerless Security\nCloud Security Monitoring and Incident Response",
  "registration_deadline": "2025-04-01",
  "selection_date": "2025-04-05",
  "start_date": "2025-04-15",
  "end_date": "2025-07-15",
  "locations": ["Online", "Lagos", "Abuja"],
  "partners": ["Amazon Web Services", "Microsoft Azure", "Google Cloud"]
}
```

---

## 🎯 LOCATIONS DATA

```json
[
  {"name": "Online", "description": "Virtual classroom with live instruction"},
  {"name": "Lagos", "description": "Lagos Technology Hub, Victoria Island"},
  {"name": "Abuja", "description": "Abuja Innovation Center, Wuse 2"},
  {"name": "Ibadan", "description": "University of Ibadan Technology Park"},
  {"name": "Port Harcourt", "description": "Port Harcourt Technology Center"},
  {"name": "Kano", "description": "Kano State ICT Center"},
  {"name": "Kaduna", "description": "Kaduna Technology City"}
]
```

---

## 🤝 PARTNERS DATA

```json
[
  {"name": "Microsoft Nigeria", "description": "Technology partner providing Azure credits and certification paths"},
  {"name": "Amazon Web Services", "description": "Cloud infrastructure partner offering AWS training resources"},
  {"name": "Google AI", "description": "AI/ML training partner providing Google Cloud credits"},
  {"name": "International Institute of Tropical Agriculture (IITA)", "description": "Research partner for agricultural data science programs"},
  {"name": "University of Agriculture Abeokuta", "description": "Academic partner for research methodology training"},
  {"name": "International Food Policy Research Institute (IFPRI)", "description": "Research partner for social science data analysis"},
  {"name": "University of Ibadan", "description": "Academic partner for advanced research training"},
  {"name": "Andela", "description": "Industry partner for software development training"},
  {"name": "Flutterwave", "description": "Fintech partner providing real-world data projects"},
  {"name": "Paystack", "description": "Payment technology partner for data science projects"},
  {"name": "Jumia Technologies", "description": "E-commerce partner for machine learning applications"},
  {"name": "Interswitch", "description": "Financial technology partner for data engineering projects"},
  {"name": "NVIDIA", "description": "Hardware partner providing GPU resources for deep learning"},
  {"name": "EC-Council", "description": "Cybersecurity certification partner"},
  {"name": "Cybersecurity Nigeria", "description": "Local cybersecurity community partner"},
  {"name": "MainOne", "description": "Telecommunications partner for network security training"},
  {"name": "Cisco Systems", "description": "Networking equipment partner for infrastructure training"},
  {"name": "CompTIA", "description": "IT certification partner"},
  {"name": "Nigerian Communications Commission", "description": "Regulatory partner for compliance training"}
]
```

---

## 📋 IMPLEMENTATION STEPS

### 1. Create Categories (Django Admin)
1. Go to Django Admin → Course Categories
2. Create the 3 categories using the JSON data above
3. Set appropriate colors and icons

### 2. Create Locations (Django Admin)
1. Go to Django Admin → Locations
2. Add all 7 locations from the locations data

### 3. Create Partners (Django Admin)
1. Go to Django Admin → Partners
2. Add all 19 partners from the partners data

### 4. Create Courses (Django Admin)
1. Go to Django Admin → Courses
2. Create each course using the detailed JSON data
3. Assign appropriate categories, locations, and partners
4. Set realistic dates (adjust dates as needed)

### 5. Assign Instructors
- Create instructor profiles for each course
- Assign appropriate expertise areas

---

## 🎓 COURSE PROGRESSION PATHS

### Research Track
1. **Beginners**: Start with "R for Science" or "R for Social Science"
2. **Advanced**: Move to specialized research methodology courses

### Professional Track
1. **Entry Level**: "Data Analyst Professional Track"
2. **Intermediate**: "Data Engineer Bootcamp"
3. **Advanced**: "Data Science Mastery Program"

### Security Track
1. **Fundamentals**: "Network Security & Infrastructure Protection"
2. **Offensive Security**: "Ethical Hacking & Penetration Testing"
3. **Specialized**: "Cloud Security & Compliance"

---

This comprehensive data structure provides a solid foundation for your production database with realistic, industry-relevant courses that align with your educational vision and target audiences.