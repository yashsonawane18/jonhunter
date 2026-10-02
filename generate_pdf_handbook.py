#!/usr/bin/env python3
"""
DRC Job Search Engine - Technical Architecture Handbook PDF Generator
Builds an executive, publication-grade PDF handbook from the technical handbook specifications.
"""

import os
import sys
import shutil
from datetime import datetime
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Preformatted
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip running header/footer on title page
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header
        self.drawString(45, 755, "DRC Job Intelligence Engine — Technical Architecture & Integration Handbook")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(45, 748, 567, 748)

        # Running Footer
        self.line(45, 45, 567, 45)
        self.drawString(45, 33, "Confidential — Prepared for Engineering Leadership & Management")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(567, 33, page_text)
        self.restoreState()


def build_handbook_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0F172A")
    secondary_color = colors.HexColor("#1E293B")
    accent_emerald = colors.HexColor("#059669")
    accent_blue = colors.HexColor("#2563EB")
    text_dark = colors.HexColor("#1E293B")
    text_muted = colors.HexColor("#475569")
    bg_light = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=accent_emerald,
        spaceAfter=15
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_muted
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_blue,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#065F46")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_dark
    )

    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # =========================================================================
    # TITLE BANNER
    # =========================================================================
    story.append(Paragraph("DRC Job Intelligence Engine", title_style))
    story.append(Paragraph("End-to-End Technical Architecture, Execution Flows & Production Roadmap", subtitle_style))
    story.append(Paragraph(f"<b>Document Version:</b> 2.0.0 &nbsp;|&nbsp; <b>Date:</b> {datetime.now().strftime('%B %d, %Y')} &nbsp;|&nbsp; <b>Target:</b> Engineering Leadership & Management", meta_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_emerald, spaceBefore=2, spaceAfter=14))

    # =========================================================================
    # 1. EXECUTIVE SUMMARY & BIG PICTURE
    # =========================================================================
    story.append(Paragraph("1. Executive Summary & Big Picture Architecture", h1_style))
    story.append(Paragraph(
        "The DRC Job Assistant platform delivers sub-20ms job discovery, deterministic ATS resume compatibility scoring, and duplicate-proof multi-batch candidate matching. To understand the architecture simply, consider the <b>Restaurant Analogy</b>:",
        body_style
    ))

    analogy_data = [
        [
            Paragraph("<b>Component</b>", table_header_style),
            Paragraph("<b>Role in Real World</b>", table_header_style),
            Paragraph("<b>Technical Stack & Port</b>", table_header_style),
            Paragraph("<b>Core Responsibility</b>", table_header_style)
        ],
        [
            Paragraph("<b>Frontend (React)</b>", table_cell_style),
            Paragraph("The Waiter", table_cell_style),
            Paragraph("React 18 + Vite (Port 5173)", table_cell_style),
            Paragraph("Captures user requirements (role, city, resume) and renders interactive job cards with ATS badges.", table_cell_style)
        ],
        [
            Paragraph("<b>Engine (Python)</b>", table_cell_style),
            Paragraph("The Kitchen / Chef", table_cell_style),
            Paragraph("FastAPI Microservice (Port 5055)", table_cell_style),
            Paragraph("Concurrently scans LinkedIn & ATS portals, calculates deterministic ATS match %, and batches results.", table_cell_style)
        ],
        [
            Paragraph("<b>Database Layer</b>", table_cell_style),
            Paragraph("The Pantry / Ledger", table_cell_style),
            Paragraph("SQLite WAL / MySQL Relational", table_cell_style),
            Paragraph("Maintains historical discovery batches, canonical fingerprints, and application tracking states.", table_cell_style)
        ]
    ]

    t_analogy = Table(analogy_data, colWidths=[105, 95, 135, 187])
    t_analogy.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_analogy)
    story.append(Spacer(1, 12))

    # =========================================================================
    # 2. COMPLETE CODEBASE FILE DIRECTORY MAP
    # =========================================================================
    story.append(Paragraph("2. Complete Codebase File Directory Map", h1_style))
    story.append(Paragraph("Every file in the codebase has a single, modular responsibility without dead weight:", body_style))

    file_map_data = [
        [Paragraph("<b>File Path</b>", table_header_style), Paragraph("<b>Layer</b>", table_header_style), Paragraph("<b>Modular Responsibility</b>", table_header_style)],
        [Paragraph("<code>src/App.tsx</code>", table_cell_style), Paragraph("Frontend", table_cell_style), Paragraph("Central router and screen switchboard (Home, QA-to-BA, Job Discovery, Tracker, Pricing).", table_cell_style)],
        [Paragraph("<code>src/components/JobDiscovery.tsx</code>", table_cell_style), Paragraph("Frontend", table_cell_style), Paragraph("Interactive job search UI with instant filters, experience selectors, and batch discovery triggers.", table_cell_style)],
        [Paragraph("<code>src/components/DiscoveredJobsTracker.tsx</code>", table_cell_style), Paragraph("Frontend", table_cell_style), Paragraph("Renders structured job cards, ATS fit badges, matched skill pills, and live application links.", table_cell_style)],
        [Paragraph("<code>src/lib/drcDiscoveryApi.ts</code>", table_cell_style), Paragraph("Frontend API", table_cell_style), Paragraph("<b>The Bridge:</b> TypeScript client making typed REST calls to the FastAPI Job Engine.", table_cell_style)],
        [Paragraph("<code>job_engine/api_server.py</code>", table_cell_style), Paragraph("Backend Core", table_cell_style), Paragraph("<b>Main Microservice:</b> FastAPI server hosting 12 REST endpoints for search, scoring, and DB ops.", table_cell_style)],
        [Paragraph("<code>job_engine/two_source_matcher.py</code>", table_cell_style), Paragraph("Backend Engine", table_cell_style), Paragraph("Parallel orchestrator executing concurrent LinkedIn and Career Page queries with cross-source deduplication.", table_cell_style)],
        [Paragraph("<code>job_engine/job_matcher.py</code>", table_cell_style), Paragraph("Backend Engine", table_cell_style), Paragraph("Real-time LinkedIn Guest API scraper extracting verified job IDs, locations, and live URLs.", table_cell_style)],
        [Paragraph("<code>job_engine/career_pages_engine.py</code>", table_cell_style), Paragraph("Backend Engine", table_cell_style), Paragraph("Direct enterprise ATS crawler indexing open requisitions across Workday, Greenhouse, Lever, and Ashby.", table_cell_style)],
        [Paragraph("<code>job_engine/ats_calculator.py</code>", table_cell_style), Paragraph("Backend ML/Alg", table_cell_style), Paragraph("Multi-dimensional ATS scorer: 45% Skill Match + 35% Title/Domain Match + 20% Experience Curve.", table_cell_style)],
        [Paragraph("<code>job_engine/deterministic_parser.py</code>", table_cell_style), Paragraph("Backend Parser", table_cell_style), Paragraph("High-speed (<100ms) Zero-LLM resume text extractor for contact info, skills, and seniority.", table_cell_style)],
        [Paragraph("<code>job_engine/db_store.py</code>", table_cell_style), Paragraph("Backend DB", table_cell_style), Paragraph("Thread-safe SQLite/WAL repository managing deduplication fingerprints, batches, and candidate status.", table_cell_style)],
        [Paragraph("<code>job_engine/query_expander.py</code>", table_cell_style), Paragraph("Backend Taxonomy", table_cell_style), Paragraph("Semantic technology taxonomy mapping queries (e.g., MERN -> React, Node, Express, Mongo).", table_cell_style)],
        [Paragraph("<code>job_engine/india_locations.py</code>", table_cell_style), Paragraph("Backend Geo", table_cell_style), Paragraph("Pan-India canonical location resolver mapping metro clusters and remote configurations.", table_cell_style)],
    ]

    t_file_map = Table(file_map_data, colWidths=[165, 75, 282])
    t_file_map.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), secondary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_file_map)
    story.append(Spacer(1, 14))

    # =========================================================================
    # 3. STEP-BY-STEP EXECUTION FLOW
    # =========================================================================
    story.append(Paragraph("3. Step-by-Step Search & Discovery Execution Journey", h1_style))
    story.append(Paragraph("When a candidate clicks <b>'Find Jobs'</b> in the UI, the system executes a 9-step sub-second pipeline:", body_style))

    steps = [
        ("Step 1: UI Trigger (React)", "Candidate selects domain/location (e.g. 'React Developer in Bengaluru') and clicks Find Jobs."),
        ("Step 2: Bridge Client (drcDiscoveryApi.ts)", "Constructs typed <code>CandidateSearchPayload</code> and dispatches <code>POST /api/jobs/search</code>."),
        ("Step 3: Vite Dev Proxy / Nginx Gateway", "Forwards request from port 5173 to local microservice on port 5055 with sub-millisecond latency."),
        ("Step 4: FastAPI Router (api_server.py)", "Validates payload via Pydantic model and invokes <code>execute_fresh_batch_discovery()</code>."),
        ("Step 5: Parallel Dual-Source Ingestion", "Spawns concurrent worker threads querying LinkedIn Guest API (Source 1) and Direct ATS Portals (Source 2)."),
        ("Step 6: Semantic Expansion & India Routing", "<code>query_expander.py</code> injects synonym clusters; <code>india_locations.py</code> resolves regional metro clusters."),
        ("Step 7: ATS Compatibility Matrix Evaluation", "<code>ats_calculator.py</code> compares candidate resume tokens vs JD requirements (45/35/20 split)."),
        ("Step 8: Three-Layer Duplicate Guard & Persistence", "<code>db_store.py</code> checks LinkedIn ID, Canonical URL, and SHA-256 fingerprint; saves batch to DB."),
        ("Step 9: Real-Time UI Hydration", "React renders sorted job cards with ATS score badges, matched skill pills, and live application URLs.")
    ]

    for s_title, s_desc in steps:
        story.append(Paragraph(f"<b>{s_title}</b>: {s_desc}", bullet_style))

    story.append(Spacer(1, 12))

    # =========================================================================
    # 4. THE BRIDGE: REACT TO PYTHON COMMUNICATION
    # =========================================================================
    story.append(Paragraph("4. The Bridge: React to Python Communication", h1_style))
    story.append(Paragraph("The React frontend communicates with the Python engine via clean REST contracts. In development, Vite acts as a reverse proxy, eliminating CORS barriers:", body_style))

    story.append(Paragraph("Vite Proxy Configuration (<code>vite.config.ts</code>):", h2_style))
    code_vite = """// vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5055', // Python FastAPI Microservice
      changeOrigin: true,
      secure: false
    }
  }
}"""
    t_code1 = Table([[Preformatted(code_vite, code_style)]], colWidths=[522])
    t_code1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_code1)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Frontend API Client Methods (<code>src/lib/drcDiscoveryApi.ts</code>):", h2_style))
    
    api_table_data = [
        [Paragraph("<b>Function</b>", table_header_style), Paragraph("<b>HTTP Route</b>", table_header_style), Paragraph("<b>Payload / Return Type</b>", table_header_style)],
        [Paragraph("<code>searchInstantJobs()</code>", table_cell_style), Paragraph("POST <code>/api/jobs/search</code>", table_cell_style), Paragraph("Instant sub-20ms 5-fresh-job allocation with duplicate guard.", table_cell_style)],
        [Paragraph("<code>findMatchingJobs()</code>", table_cell_style), Paragraph("POST <code>/api/find-jobs</code>", table_cell_style), Paragraph("Personalized matching against candidate's parsed resume profile.", table_cell_style)],
        [Paragraph("<code>findTwoSourceJobs()</code>", table_cell_style), Paragraph("POST <code>/api/find-two-source-jobs</code>", table_cell_style), Paragraph("Side-by-side comparative LinkedIn and Career Page listings.", table_cell_style)],
        [Paragraph("<code>getDiscoveredJobsHistory()</code>", table_cell_style), Paragraph("GET <code>/api/discovered-jobs</code>", table_cell_style), Paragraph("Loads all historical discovery batches for candidate email.", table_cell_style)],
        [Paragraph("<code>updateJobStatus()</code>", table_cell_style), Paragraph("POST <code>/api/update-job-status</code>", table_cell_style), Paragraph("Persists Applied / Not Applied status and custom remarks.", table_cell_style)],
        [Paragraph("<code>checkJobEngineHealth()</code>", table_cell_style), Paragraph("GET <code>/api/health</code>", table_cell_style), Paragraph("Health probe returning service status and engine version.", table_cell_style)],
    ]

    t_api = Table(api_table_data, colWidths=[140, 155, 227])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 10))

    # =========================================================================
    # 5. TWO-SOURCE JOB DISCOVERY ENGINE
    # =========================================================================
    story.append(Paragraph("5. Two-Source Job Discovery Engine", h1_style))
    story.append(Paragraph(
        "To maximize candidate conversion and eliminate expired postings, the engine ingests from two distinct live sources concurrently:",
        body_style
    ))

    story.append(Paragraph("<b>Source 1: Real-Time LinkedIn Guest API (<code>job_matcher.py</code>)</b>", h2_style))
    story.append(Paragraph("• Queries LinkedIn's public guest search endpoints without requiring user login or credentials.", bullet_style))
    story.append(Paragraph("• Applies semantic role expansion and geo-clustering across India Metro hubs (Bangalore, Pune, Hyderabad, Gurgaon, Mumbai).", bullet_style))
    story.append(Paragraph("• Extracts verified numeric Job IDs (e.g. <code>4102938476</code>) and builds direct view URLs: <code>https://www.linkedin.com/jobs/view/{id}</code>.", bullet_style))

    story.append(Paragraph("<b>Source 2: Direct Enterprise ATS & Career Pages (<code>career_pages_engine.py</code>)</b>", h2_style))
    story.append(Paragraph("• Directly indexes company career portals powered by Workday, Greenhouse, Lever, Ashby, and SmartRecruiters.", bullet_style))
    story.append(Paragraph("• Scrapes open corporate requisitions with guaranteed 100% active application links.", bullet_style))
    story.append(Paragraph("• Eliminates recruiter middlemen and gives candidates direct access to hiring managers.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # 6. ATS COMPATIBILITY SCORING ALGORITHM
    # =========================================================================
    story.append(Paragraph("6. ATS Compatibility Scoring Algorithm", h1_style))
    story.append(Paragraph(
        "The scoring algorithm in <code>ats_calculator.py</code> computes a deterministic compatibility score (0–100%) across three balanced dimensions:",
        body_style
    ))

    ats_breakdown_data = [
        [Paragraph("<b>Evaluation Dimension</b>", table_header_style), Paragraph("<b>Weight</b>", table_header_style), Paragraph("<b>Scoring Formula & Logic</b>", table_header_style)],
        [
            Paragraph("<b>1. Skill Matrix Match</b>", table_cell_style),
            Paragraph("<b>45% Max</b>", table_cell_style),
            Paragraph("Compares candidate's parsed skills against JD key skills and full text. Matches are added to <code>matched_skills</code>, gaps to <code>missing_skills</code>. <code>Score = (Matched / Required) * 45</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>2. Title & Domain Fit</b>", table_cell_style),
            Paragraph("<b>35% Max</b>", table_cell_style),
            Paragraph("Evaluates token overlap between candidate's primary domain / target roles and the job title. Domain hit = +12 pts; Role hit = +8 pts (clamped between 10 and 35).", table_cell_style)
        ],
        [
            Paragraph("<b>3. Experience Curve</b>", table_cell_style),
            Paragraph("<b>20% Max</b>", table_cell_style),
            Paragraph("Compares candidate years vs JD range (e.g. 3-5 yrs). Exact fit = 20 pts; 1 yr gap = 16 pts; 2.5 yr gap = 11 pts; Overqualified/Senior fit = 17-19 pts.", table_cell_style)
        ],
        [
            Paragraph("<b>Total ATS Score</b>", table_cell_style),
            Paragraph("<b>100%</b>", table_cell_style),
            Paragraph("<b>Tiers:</b> Excellent (85–100%) | Good (70–84%) | Fair (55–69%) | Low (<55%)", table_cell_style)
        ]
    ]

    t_ats = Table(ats_breakdown_data, colWidths=[120, 65, 337])
    t_ats.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), secondary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_ats)
    story.append(Spacer(1, 10))

    # =========================================================================
    # 7. DATABASE ARCHITECTURE & THREE-LAYER DUPLICATE GUARD
    # =========================================================================
    story.append(Paragraph("7. Database Architecture & Three-Layer Duplicate Guard", h1_style))
    story.append(Paragraph("The database repository (<code>db_store.py</code>) operates in SQLite Write-Ahead Logging (WAL) mode for concurrency and zero lock contention:", body_style))

    story.append(Paragraph("<b>Primary Relational Tables:</b>", h2_style))
    story.append(Paragraph("• <code>discovered_jobs</code>: Master ledger of every discovered requisition with canonical URL, fingerprint, and ATS metrics.", bullet_style))
    story.append(Paragraph("• <code>discovery_batches</code>: Sequential batch records (Batch 1, Batch 2...) tracking candidate discovery sessions.", bullet_style))
    story.append(Paragraph("• <code>candidates</code>: Candidate profiles, parsed skills, domain preferences, and resume texts.", bullet_style))
    story.append(Paragraph("• <code>candidate_applications</code>: Submitted job applications for recruiter tracking and follow-up.", bullet_style))
    story.append(Paragraph("• <code>companies</code> & <code>job_skills</code>: Normalized company metadata and 1-to-many indexed technical skills.", bullet_style))

    story.append(Paragraph("<b>Three-Layer Duplicate Guard Logic:</b>", h2_style))
    story.append(Paragraph("1. <b>LinkedIn Job ID Layer:</b> Extracts numeric ID from URL. If ID was previously discovered for candidate -> <i>Discard</i>.", bullet_style))
    story.append(Paragraph("2. <b>Canonical URL Layer:</b> Strips query parameters, UTM tags, and session trackers to base URL -> <i>Discard if seen</i>.", bullet_style))
    story.append(Paragraph("3. <b>Company + Title Fingerprint Layer:</b> Normalizes company (removes 'Pvt Ltd', 'Tech') and title (removes 'Senior', 'Lead') into SHA-256 fingerprint -> <i>Prevents duplicate listings under slightly different titles</i>.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # 8. PRODUCTION INTEGRATION ROADMAP (JAVA + MYSQL + AWS EC2)
    # =========================================================================
    story.append(Paragraph("8. Production Integration: Java + MySQL + AWS EC2", h1_style))
    story.append(Paragraph(
        "In your production environment, the Python Job Engine functions as a <b>dedicated internal microservice</b> alongside your Java Spring Boot backend and MySQL database on AWS EC2:",
        body_style
    ))

    story.append(Paragraph("<b>Production Deployment Architecture:</b>", h2_style))
    story.append(Paragraph("• <b>Nginx (Port 443 / SSL):</b> Serves compiled React static assets (<code>/var/www/html</code>) and reverse proxies <code>/api/*</code> to Java Spring Boot.", bullet_style))
    story.append(Paragraph("• <b>Java Spring Boot (Port 8080):</b> Handles authentication, user management, payments, and connects to AWS RDS MySQL via HikariCP.", bullet_style))
    story.append(Paragraph("• <b>Python Job Engine (Port 5055):</b> Companion microservice bound to <code>127.0.0.1</code> (internal only). Scrapes, parses, and scores jobs upon Java request.", bullet_style))
    story.append(Paragraph("• <b>MySQL Database (AWS RDS / Port 3306):</b> Persists candidates, job matches, and application statuses across all microservices.", bullet_style))

    story.append(Paragraph("Sample Java Spring Boot Integration Service (<code>JobDiscoveryService.java</code>):", h2_style))
    code_java = """@Service
public class JobDiscoveryService {
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PYTHON_ENGINE = "http://127.0.0.1:5055";

    public List<JobDTO> discoverJobs(CandidateDTO candidate, String role, String location) {
        Map<String, Object> request = Map.of(
            "query", role,
            "location", location,
            "candidate", Map.of(
                "name", candidate.getName(),
                "email", candidate.getEmail(),
                "top_skills", candidate.getSkills(),
                "total_experience_years", candidate.getExperience()
            ),
            "limit", 5,
            "source", "all"
        );

        // Call Python Microservice (exact same JSON contract as React)
        ResponseEntity<Map> response = restTemplate.postForEntity(
            PYTHON_ENGINE + "/api/jobs/search", request, Map.class
        );

        List<Map> jobs = (List<Map>) response.getBody().get("jobs");
        return jobs.stream().map(this::saveAndConvertToDTO).collect(Collectors.toList());
    }
}"""
    t_code2 = Table([[Preformatted(code_java, code_style)]], colWidths=[522])
    t_code2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_code2)
    story.append(Spacer(1, 10))

    # =========================================================================
    # SUMMARY CALLOUT
    # =========================================================================
    summary_box_data = [[
        Paragraph(
            "<b>Key Takeaway for Management:</b> The Python Job Engine is a self-contained, microservice-ready system. "
            "It decouples complex web scraping and ATS scoring algorithms from the main application. In production on AWS EC2, "
            "Java Spring Boot simply invokes the Python engine's existing REST endpoints internally with <b>zero code changes required</b> on the engine layer.",
            callout_style
        )
    ]]
    t_summary = Table(summary_box_data, colWidths=[522])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
        ('BOX', (0, 0), (-1, -1), 1, accent_emerald),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t_summary)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF at: {output_path}")

if __name__ == '__main__':
    project_pdf = r"D:\Dheeraj Rathod consult\forntend\AiJobAssistantFrontEnd-dev\DRC_Job_Search_Engine_Technical_Handbook.pdf"
    artifact_pdf = r"C:\Users\Dell\.gemini\antigravity\brain\84bace06-5358-4c85-b748-8db069ac3d85\DRC_Job_Search_Engine_Technical_Handbook.pdf"

    build_handbook_pdf(project_pdf)
    shutil.copy2(project_pdf, artifact_pdf)
    print("PDF generation complete in both locations!")
