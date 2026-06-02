from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, CheckConstraint
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, Field, EmailStr
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELS ---
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False)
    __table_args__ = (CheckConstraint('stock >= 0', name='check_stock_positive'),)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- STRICT SCHEMAS (Request Validation) ---
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Product name cannot be empty")
    sku: str = Field(..., min_length=1)
    price: float = Field(..., ge=0.0, description="Price cannot be negative")
    stock: int = Field(..., ge=0, description="Product quantity cannot be negative") # Rule: Cannot be negative

class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=5) # Basic validation, can use EmailStr if email-validator is installed
    phone: str = Field(..., min_length=5)

class OrderCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(..., gt=0, description="Order quantity must be at least 1") # Rule: Order quantity must be > 0

# --- APIs (Proper Error Handling & Status Codes) ---
@app.post("/products/", status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.dict())
    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Product SKU must be unique")

@app.get("/products/")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@app.get("/products/{id}")
def get_product(id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod: raise HTTPException(status_code=404, detail="Product not found")
    return prod

@app.put("/products/{id}")
def update_product(id: int, product: ProductCreate, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod: raise HTTPException(status_code=404, detail="Product not found")
    
    # Catch potential unique constraint violations during update
    try:
        for key, value in product.dict().items(): setattr(prod, key, value)
        db.commit()
        return prod
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Product SKU must be unique")

@app.delete("/products/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod: raise HTTPException(status_code=404, detail="Product not found")
    db.delete(prod)
    db.commit()
    return {"message": "Deleted successfully"}

@app.post("/customers/", status_code=201)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    db_customer = Customer(**customer.dict())
    try:
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Customer email must be unique")

@app.get("/customers/")
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@app.get("/customers/{id}")
def get_customer(id: int, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == id).first()
    if not cust: raise HTTPException(status_code=404, detail="Customer not found")
    return cust

@app.delete("/customers/{id}")
def delete_customer(id: int, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == id).first()
    if not cust: raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(cust)
    db.commit()
    return {"message": "Deleted successfully"}

@app.post("/orders/", status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == order.product_id).first()
    
    # Rule: Error handling / Validations
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer: raise HTTPException(status_code=404, detail="Customer not found")

    # Rule: Orders cannot be placed if inventory is insufficient
    if product.stock < order.quantity: 
        raise HTTPException(status_code=400, detail="Insufficient product stock")
    
    # Rule: Total order amount automatically calculated
    calculated_total = float(product.price * order.quantity)
    
    db_order = Order(customer_id=order.customer_id, product_id=order.product_id, quantity=order.quantity, total_amount=calculated_total)
    db.add(db_order)
    
    # Rule: Automatic stock reduction
    product.stock -= order.quantity
    
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/")
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()

@app.get("/orders/{id}")
def get_order(id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.delete("/orders/{id}")
def delete_order(id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if product:
        product.stock += order.quantity
        
    db.delete(order)
    db.commit()
    return {"message": "Deleted successfully, Stock restored"}