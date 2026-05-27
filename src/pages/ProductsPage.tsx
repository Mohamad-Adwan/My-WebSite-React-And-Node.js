
import React, { useState, useEffect } from 'react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Product } from '@/types';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { productApi } from '@/services/apiService';

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({min: '', max: ''});
    
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;
    const [Items, setItems] = useState<Product[]>([]);
    useEffect(() => {
      const fetchItems = async () => {
        try {
          const items = await productApi.getAll(); // Assuming this fetches products
          setItems(items);
        } catch (error) {
          console.error('Failed to fetch cart items:', error);
        }
      };
      fetchItems();
    }, []);
  // Extract unique categories
  //const categories = ['all', ...new Set(Items.map(product => product.category))];
  const categories = ['all', ...new Set(Items.map(product => product.category).filter(c => c && c !== ''))];
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(Items);

  // Apply filters
  useEffect(() => {
    let result = [...Items];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
  //   setFilteredProducts(result);
  // }, [searchQuery, categoryFilter]);
   // Apply price range filter
   if (priceRange.min) {
    //result = result.filter(product => product.price >= parseFloat(priceRange.min));
    result = result.filter(product => {
      const effectivePrice = product.discountprice > 0 ? product.discountprice : product.price;
      return effectivePrice >= parseFloat(priceRange.min);
  });
  
  }
  if (priceRange.max) {
    // result = result.filter(product => product.price <= parseFloat(priceRange.max));
    result = result.filter(product => {
      const effectivePrice = product.discountprice > 0 ? product.discountprice : product.price;
      return effectivePrice <= parseFloat(priceRange.max);
  });
  }
  
  // Apply sorting
  switch (sortBy) {
    case 'price-asc':
      // result.sort((a, b) => a.price - b.price);
      result.sort((a, b) => {
        const priceA = a.discountprice > 0 ? a.discountprice : a.price;
        const priceB = b.discountprice > 0 ? b.discountprice : b.price;
        return priceA - priceB;
    });
      break;
    case 'price-desc':
      // result.sort((a, b) => b.price - a.price);
      result.sort((a, b) => {
        const priceA = a.discountprice > 0 ? a.discountprice : a.price;
        const priceB = b.discountprice > 0 ? b.discountprice : b.price;
        return priceB - priceA; // descending
    });
      break;
    case 'name-asc':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    // case 'rating-desc':
    //   result.sort((a, b) => b.rating - a.rating);
    //   break;
    default:
      // Keep default order
      break;
  }
  
  setFilteredProducts(result);
   // Reset to first page when filters change
   setCurrentPage(1);
}, [searchQuery, categoryFilter, sortBy, priceRange]);

const handlePriceChange = (type: 'min' | 'max', value: string) => {
  setPriceRange(prev => ({
    ...prev,
    [type]: value
  }));
  
};

const clearFilters = () => {
  setSearchQuery('');
  setCategoryFilter('all');
  setSortBy('default');
  setPriceRange({min: '', max: ''});
};
const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show fewer pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 3; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full md:w-64">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <div className="flex items-center">
                  {sortBy.includes('-desc') ? 
                    <SortDesc className="h-4 w-4 mr-2" /> : 
                    <SortAsc className="h-4 w-4 mr-2" />
                  }
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  {/* <SelectItem value="rating-desc">Highest Rated</SelectItem> */}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-1 gap-2 items-center">
            <Input
              type="number"
              placeholder="Min price"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="number"
              placeholder="Max price"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full"
            />
          </div>
          
          {(searchQuery || categoryFilter !== 'all' || sortBy !== 'default' || priceRange.min || priceRange.max) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length === 0 ?(searchQuery.length ===0 ?(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Items.map((product) => (
            <ProductCard key={product.id1} product={product} />
          ))}
        </div>): (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No products match your search criteria.
          </p>
        </div>
      ) ): (
        // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        //   {filteredProducts.map((product) => (
        //     <ProductCard key={product.id1} product={product} />
        //   ))}
        // </div>
        // {here add pagination}
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product.id1} product={product} />
            ))}
          </div>
          
          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={prevPage} 
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink 
                          isActive={page === currentPage}
                          onClick={() => paginate(page as number)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={nextPage} 
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
              </div>
            </div>
          )}
        </>
        // {here add pagination}
      )}
    </div>
  );
};

export default ProductsPage;
