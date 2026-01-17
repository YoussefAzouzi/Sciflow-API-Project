import asyncio
import sys
import os
from datetime import date

# Ensure we can import from the app directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import async_session
from app.models import User, Conference, UserRole
from sqlalchemy.future import select

# Real-world conference data (approximate dates/locations for future events)
CONFERENCES_DATA = [
    {
        "name": "AAAI Conference on Artificial Intelligence 2026",
        "acronym": "AAAI 2026",
        "location": "Vancouver, Canada",
        "start_date": date(2026, 2, 20),
        "end_date": date(2026, 2, 27),
        "website": "https://aaai.org/aaai-conference/",
        "topics": "Artificial Intelligence, Machine Learning, Robotics",
        "description": "The AAAI Conference on Artificial Intelligence promotes research in AI and scientific exchange among AI researchers, practitioners, scientists, and engineers in affiliated disciplines.",
        "colocated_with": ["IAAI Innovative Applications of AI"]
    },
    {
        "name": "Advances in Data Science and Artificial Intelligence Conference 2025",
        "acronym": "ADSAI 2025",
        "location": "Manchester, UK",
        "start_date": date(2025, 6, 15),
        "end_date": date(2025, 6, 17),
        "website": "https://www.idsai.manchester.ac.uk/connect/events/conference/idsai-conference-2025/",
        "topics": "Data Science, AI Ethics, Health Data",
        "description": "Annual conference bringing together researchers and practioners in data science and AI.",
        "colocated_with": ["IDSAI Short Talks", "Poster Session"]
    },
    {
        "name": "Data + AI Summit 2026",
        "acronym": "DAIS 2026",
        "location": "San Francisco, USA",
        "start_date": date(2026, 6, 10),
        "end_date": date(2026, 6, 14),
        "website": "https://www.databricks.com/dataaisummit",
        "topics": "Big Data, Lakehouse, Apache Spark, MLflow",
        "description": "The premier event for the data and AI community, organizing by Databricks.",
        "colocated_with": ["Lakehouse Dev Day", "Partner Summit"]
    },
    {
        "name": "The AI Conference San Francisco 2026",
        "acronym": "AI SF 2026",
        "location": "San Francisco, USA",
        "start_date": date(2026, 9, 20),
        "end_date": date(2026, 9, 22),
        "website": "https://aiconference.com/",
        "topics": "Applied AI, Generative AI, Enterprise AI",
        "description": "Bridging the gap between AI research and industry applications.",
        "colocated_with": ["AI Startup Expo"]
    },
    {
        "name": "World Summit AI 2026",
        "acronym": "WSAI 2026",
        "location": "Amsterdam, Netherlands",
        "start_date": date(2026, 10, 8),
        "end_date": date(2026, 10, 9),
        "website": "https://worldsummit.ai/",
        "topics": "Global AI Ecosystem, Policy, Business Strategy",
        "description": "The world’s leading AI summit for the entire AI ecosystem from enterprise to big tech, startups, investors and science.",
        "colocated_with": ["Intelligent Health AI", "World AI Week"]
    },
    {
        "name": "Big Data Conference Europe 2026",
        "acronym": "BDCE 2026",
        "location": "Vilnius, Lithuania",
        "start_date": date(2026, 11, 20),
        "end_date": date(2026, 11, 22),
        "website": "https://bigdataconference.eu/",
        "topics": "Big Data, High Load, Data Privacy, Machine Learning",
        "description": "A technical conference for developers, IT professionals, and users to share their experience.",
        "colocated_with": ["Kafka Workshop", "Spark Workshop"]
    },
    {
        "name": "Optimized AI Conference 2025",
        "acronym": "Optimized AI 2025",
        "location": "Atlanta, USA",
        "start_date": date(2025, 11, 5),
        "end_date": date(2025, 11, 7),
        "website": "https://www.optimizedaiconf.com/",
        "topics": "Optimization, AI Efficiency, Hardware Acceleration",
        "description": "Focusing on making AI models smaller, faster, and more efficient.",
        "colocated_with": ["Southern Data Science Workshops"]
    },
    {
        "name": "SC 2026: HPC, Networking, Storage and Analysis",
        "acronym": "SC 2026",
        "location": "Denver, USA",
        "start_date": date(2026, 11, 15),
        "end_date": date(2026, 11, 20),
        "website": "https://sc24.supercomputing.org/",
        "topics": "High Performance Computing, Supercomputing, Exascale",
        "description": "The International Conference for High Performance Computing, Networking, Storage, and Analysis.",
        "colocated_with": ["HPC Tutorials", "Exascale Systems Workshop"]
    },
    {
        "name": "International Conference on Machine Learning 2026",
        "acronym": "ICML 2026",
        "location": "Vienna, Austria",
        "start_date": date(2026, 7, 12),
        "end_date": date(2026, 7, 18),
        "website": "https://icml.cc/",
        "topics": "Machine Learning, Deep Learning, Statistical Learning",
        "description": "One of the premier academic conferences in machine learning.",
        "colocated_with": ["ICML Workshops", "ICML Tutorials"]
    },
    {
        "name": "International Conference on Data Engineering 2026",
        "acronym": "ICDE 2026",
        "location": "Rio de Janeiro, Brazil",
        "start_date": date(2026, 4, 15),
        "end_date": date(2026, 4, 19),
        "website": "https://icde.org/",
        "topics": "Data Engineering, Databases, Data Systems",
        "description": "Addressing research issues in designing, building, managing, and evaluating advanced data-intensive systems.",
        "colocated_with": ["Data Management Workshops"]
    },
    {
        "name": "NeurIPS 2025",
        "acronym": "NeurIPS 2025",
        "location": "Vancouver, Canada",
        "start_date": date(2025, 12, 8),
        "end_date": date(2025, 12, 14),
        "website": "https://neurips.cc/",
        "topics": "Neural Networks, Deep Learning, Neuroscience",
        "description": "Conference on Neural Information Processing Systems.",
        "colocated_with": ["NeurIPS Workshops", "Women in ML"]
    },
    {
        "name": "CVPR 2026",
        "acronym": "CVPR 2026",
        "location": "New Orleans, USA",
        "start_date": date(2026, 6, 14),
        "end_date": date(2026, 6, 19),
        "website": "https://cvpr.thecvf.com/",
        "topics": "Computer Vision, Pattern Recognition",
        "description": "The premier annual computer vision event comprising the main conference and several co-located workshops and short courses.",
        "colocated_with": ["CVPR Workshops"]
    },
    {
        "name": "ICLR 2026",
        "acronym": "ICLR 2026",
        "location": "Singapore",
        "start_date": date(2026, 5, 4),
        "end_date": date(2026, 5, 8),
        "website": "https://iclr.cc/",
        "topics": "Learning Representations, Deep Learning",
        "description": "Dedicated to the advancement of the branch of artificial intelligence called representation learning.",
        "colocated_with": []
    },
    {
        "name": "ACL 2026",
        "acronym": "ACL 2026",
        "location": "Dublin, Ireland",
        "start_date": date(2026, 8, 9),
        "end_date": date(2026, 8, 14),
        "website": "https://www.aclweb.org/",
        "topics": "Computational Linguistics, NLP",
        "description": "The premier conference of the Association for Computational Linguistics.",
        "colocated_with": ["SemEval"]
    },
    {
        "name": "KDD 2026",
        "acronym": "KDD 2026",
        "location": "London, UK",
        "start_date": date(2026, 8, 23),
        "end_date": date(2026, 8, 27),
        "website": "https://kdd.org/",
        "topics": "Knowledge Discovery, Data Mining",
        "description": "The premier interdisciplinary conference bringing together researchers and practitioners from data science, data mining, KDD, and big data.",
        "colocated_with": ["KDD Cup"]
    },
    {
        "name": "SIGMOD 2026",
        "acronym": "SIGMOD 2026",
        "location": "Philadelphia, USA",
        "start_date": date(2026, 6, 21),
        "end_date": date(2026, 6, 26),
        "website": "https://sigmod.org/",
        "topics": "Database Management, Data Systems",
        "description": "International Conference on Management of Data.",
        "colocated_with": ["PODS"]
    },
    {
        "name": "The Web Conference 2026",
        "acronym": "WWW 2026",
        "location": "Hyderabad, India",
        "start_date": date(2026, 4, 27),
        "end_date": date(2026, 5, 1),
        "website": "https://www2026.thewebconf.org/",
        "topics": "Web Technologies, Social Networks, Internet",
        "description": "The premier international conference for the World Wide Web.",
        "colocated_with": ["Web4All"]
    },
    {
        "name": "IJCAI 2026",
        "acronym": "IJCAI 2026",
        "location": "Shanghai, China",
        "start_date": date(2026, 7, 25),
        "end_date": date(2026, 7, 31),
        "website": "https://ijcai.org/",
        "topics": "General Artificial Intelligence",
        "description": "International Joint Conference on Artificial Intelligence.",
        "colocated_with": ["ECAI"]
    },
    {
        "name": "ECCV 2026",
        "acronym": "ECCV 2026",
        "location": "Paris, France",
        "start_date": date(2026, 10, 10),
        "end_date": date(2026, 10, 16),
        "website": "https://eccv2026.eu/",
        "topics": "Computer Vision",
        "description": "European Conference on Computer Vision.",
        "colocated_with": []
    },
    {
        "name": "EMNLP 2025",
        "acronym": "EMNLP 2025",
        "location": "Miami, USA",
        "start_date": date(2025, 11, 5),
        "end_date": date(2025, 11, 9),
        "website": "https://emnlp.org/",
        "topics": "NLP, Computational Linguistics",
        "description": "Conference on Empirical Methods in Natural Language Processing.",
        "colocated_with": []
    }
]

async def seed_data():
    print("Starting database population...")
    
    # Create tables if they don't exist
    from app.db import engine, Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        async with session.begin():
            # 1. Get or Create an Organizer User
            stmt = select(User).where(User.email == "organizer@sciflow.com")
            result = await session.execute(stmt)
            organizer = result.scalars().first()

            if not organizer:
                print("Creating seed organizer account...")
                organizer = User(
                    email="organizer@sciflow.com",
                    # Using a dummy hash for 'password123'
                    hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", 
                    full_name="Sciflow Organizer",
                    role=UserRole.ORGANIZER
                )
                session.add(organizer)
                await session.flush() # Flush to get the ID
            
            print(f"Using organizer: {organizer.full_name} (ID: {organizer.id})")

            # 2. Insert Conferences
            count = 0
            for conf_data in CONFERENCES_DATA:
                # Check if conference with same name exists to avoid duplicates
                stmt = select(Conference).where(Conference.name == conf_data["name"])
                result = await session.execute(stmt)
                existing_conf = result.scalars().first()

                if existing_conf:
                    print(f"Skipping {conf_data['acronym']}: Already exists.")
                    continue

                # Prepare colocated_with as string if it is a list
                colocated = conf_data.get("colocated_with", "")
                if isinstance(colocated, list):
                    colocated = ", ".join(colocated)

                new_conf = Conference(
                    organizer_id=organizer.id,
                    name=conf_data["name"],
                    acronym=conf_data["acronym"],
                    location=conf_data["location"],
                    start_date=conf_data["start_date"],
                    end_date=conf_data["end_date"],
                    topics=conf_data["topics"],
                    description=conf_data["description"],
                    website=conf_data["website"],
                    colocated_with=colocated,
                    publisher="IEEE" if "IEEE" in conf_data["name"] else "ACM" if "ACM" in conf_data["name"] else "Sciflow"
                )
                session.add(new_conf)
                count += 1
            
            print(f"Added {count} new conferences.")
            
    print("Database population complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
