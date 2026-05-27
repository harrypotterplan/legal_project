import chromadb

# 1. 확인하고 싶은 DB 폴더 선택
# 'chroma_db'를 보고 싶으면 "./chroma_db", 'chroma_db_law'를 보고 싶으면 "./chroma_db_law"로 변경하세요.
db_path = "./chroma_db_law" 
client = chromadb.PersistentClient(path=db_path)

# 2. 컬렉션 목록 확인
collections = client.list_collections()
print(f"📂 '{db_path}' 내의 컬렉션 목록: {collections}")

# 3. 데이터 확인
if collections:
    collection_name = collections[0].name
    collection = client.get_collection(name=collection_name)
    
    count = collection.count()
    print(f"\n📊 '{collection_name}' 컬렉션의 총 데이터 수: {count}개")
    
    print(f"\n👀 '{collection_name}' 데이터 미리보기 (상위 3개):")
    peek_data = collection.peek(limit=3)
    print(peek_data)
else:
    print("해당 DB에 컬렉션이 없습니다.")