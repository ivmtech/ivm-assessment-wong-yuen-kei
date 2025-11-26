using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ivm.Assessment.Backend.Data;
using Ivm.Assessment.Backend.Models;

namespace Ivm.Assessment.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly VendingDbContext _db;

    public ProductsController(VendingDbContext db)
    {
        _db = db;
    }

    // GET: api/products
    // [TODO 1]: Return all products from database
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        // [TODO 1]: here
        var products = await _db.Products.ToListAsync();
        return Ok(products);
    }

    // POST: api/products/purchase
    // [TODO 2]: Implement purchase logic
    // 1.
    // 2. Calulate updated Stock accordingly
    // 3. Create Purchase record and save to database, return success response
    // 4. Api is expected to be throw error when:
    // a. missing request payload
    // b. out of stock + product not found (double check in api layer in addition to frontend)(500 and 404 accordingly with proper msg)
    // c. [BOUNS TODO 3]: call this api again within 5 seconds(To stimulate real machine behaviour)
    // NOTES: you can add functions/variable inside the controller class if need
    [HttpPost("purchase")]
    public async Task<ActionResult<PurchaseResponse>> Purchase([FromBody] PurchaseRequest? request)
    {
        // simulate machine response delay (original file used Thread.Sleep(5000))
        await Task.Delay(5000);

        // [TODO 2,3]: here

        if (request is null)
        {
            return BadRequest(new PurchaseResponse
            {
                Success = false,
                Message = "Missing request payload."
            });
        }

        if (request.Quantity <= 0)
        {
            return BadRequest(new PurchaseResponse
            {
                Success = false,
                Message = "Quantity must be greater than zero."
            });
        }

        var product = await _db.Products.FindAsync(request.ProductID);
        if (product is null)
        {
            return NotFound(new PurchaseResponse
            {
                Success = false,
                Message = "Product not found."
            });
        }

        // Prevent rapid repeated purchases for the same product (5 seconds)
        var lastPurchase = await _db.Purchases
            .Where(p => p.ProductName == product.Name)
            .OrderByDescending(p => p.PurchaseTime)
            .FirstOrDefaultAsync();

        if (lastPurchase is not null && (DateTime.UtcNow - lastPurchase.PurchaseTime).TotalSeconds < 5)
        {
            return StatusCode(429, new PurchaseResponse
            {
                Success = false,
                Message = "Please wait a few seconds before trying again."
            });
        }

        if (product.Stock < request.Quantity)
        {
            return StatusCode(500, new PurchaseResponse
            {
                Success = false,
                Message = "Out of stock.",
                Remaining = product.Stock
            });
        }

        // Compute totals and update stock
        var quantity = request.Quantity;
        var totalCost = product.Price * quantity;

        product.Stock -= quantity;
        _db.Products.Update(product);

        // Capture machine id if provided via header; fallback to unknown
        var machineId = Request.Headers.TryGetValue("X-Machine-Id", out var mid) && !string.IsNullOrWhiteSpace(mid)
            ? mid.ToString()
            : "machine-unknown";

        var purchase = new Purchase
        {
            ProductId = product.Id,          // <-- set ProductId so NOT NULL constraint is satisfied
            ProductName = product.Name,
            Quantity = quantity,
            Amount = totalCost,
            PurchaseTime = DateTime.UtcNow,
            MachineId = machineId
        };

        await _db.Purchases.AddAsync(purchase);
        await _db.SaveChangesAsync();

        var response = new PurchaseResponse
        {
            Success = true,
            Message = "Purchase successful.",
            Remaining = product.Stock,
            QuantityPurchased = quantity,
            TotalCost = totalCost,
            Warning = product.Stock <= 2 ? "Low stock" : null
        };

        try
        {
            response.ProductId = product.Id;
            response.RemainingStock = product.Stock;
        }
        catch
        {
            // ignore if internal set doesn't allow assignment in some build scenarios
        }

        return Ok(response);
    }

    // GET: api/products/purchases
    // [TODO 4]: Return all purchases from database
    // [BONUS TODO 5]: Support server side filtering with query parameters
    // Example: ?searchTerm=coke&machineId=machine-001&hours=24&sortField=amount&sortOrder=desc
    [HttpGet("purchases")]
    public async Task<ActionResult<IEnumerable<Purchase>>> GetPurchases([FromQuery] PurchaseFilterParams? filter)
    {
        // [TODO 4,5]: here
        var query = _db.Purchases.AsQueryable();

        if (filter is not null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.Trim().ToLowerInvariant();
                query = query.Where(p => p.ProductName.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(filter.MachineId))
            {
                query = query.Where(p => p.MachineId == filter.MachineId);
            }

            if (filter.Hours.HasValue && filter.Hours.Value > 0)
            {
                var from = DateTime.UtcNow.AddHours(-filter.Hours.Value);
                query = query.Where(p => p.PurchaseTime >= from);
            }

            // Sorting
            var sortField = (filter.SortField ?? "purchaseTime").ToLowerInvariant();
            var sortOrderDesc = (filter.SortOrder ?? "desc").ToLowerInvariant() == "desc";

            query = (sortField) switch
            {
                "amount" => sortOrderDesc ? query.OrderByDescending(p => p.Amount) : query.OrderBy(p => p.Amount),
                "quantity" => sortOrderDesc ? query.OrderByDescending(p => p.Quantity) : query.OrderBy(p => p.Quantity),
                "productname" => sortOrderDesc ? query.OrderByDescending(p => p.ProductName) : query.OrderBy(p => p.ProductName),
                _ => sortOrderDesc ? query.OrderByDescending(p => p.PurchaseTime) : query.OrderBy(p => p.PurchaseTime),
            };
        }
        else
        {
            // default ordering
            query = query.OrderByDescending(p => p.PurchaseTime);
        }

        var purchases = await query.ToListAsync();
        return Ok(purchases);
    }


    // GET: api/products/balance
    [HttpGet("balance")]
    public ActionResult GetBalance()
    {
        Random random = new Random();
        double randomNumber = random.NextDouble() * 9 + 1;
        double roundedNumber = Math.Round(randomNumber, 2);
        return Ok(new { balance = roundedNumber });
    }
}

// Helper type used for server-side filtering (query params)
public record PurchaseFilterParams
{
    public string? SearchTerm { get; init; }
    public string? MachineId { get; init; }
    public int? Hours { get; init; }
    public string? SortField { get; init; }
    public string? SortOrder { get; init; }
}