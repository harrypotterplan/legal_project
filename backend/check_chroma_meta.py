import chromadb

# 판례 ChromaDB 확인
case_client = chromadb.PersistentClient(path="./chroma_db")
case_col = case_client.get_collection("jurisim_cases")

case_result = case_col.get(limit=3, include=["metadatas", "documents"])

print("===== 판례 ChromaDB 샘플 =====")
for meta in case_result["metadatas"]:
    print(meta)
    print()

# 법령 ChromaDB 확인
try:
    law_client = chromadb.PersistentClient(path="./chroma_db_law")
    law_col = law_client.get_collection("jurisim_laws")

    law_result = law_col.get(limit=3, include=["metadatas", "documents"])

    print("===== 법령 ChromaDB 샘플 =====")
    for meta in law_result["metadatas"]:
        print(meta)
        print()

except Exception as e:
    print("법령 ChromaDB 확인 실패:", e)