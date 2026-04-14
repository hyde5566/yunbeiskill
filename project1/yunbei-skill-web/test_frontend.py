import asyncio
import sys
from playwright.async_api import async_playwright

async def test_frontend():
    results = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        base_url = "http://localhost:5173"
        
        # 1. Login first
        try:
            await page.goto(f"{base_url}/login", wait_until="networkidle")
            inputs = await page.locator('.ant-input').all()
            await inputs[0].fill('admin')
            await inputs[1].fill('admin123')
            await page.locator('.ant-btn-primary').click()
            await page.wait_for_url("**/", timeout=15000)
            results.append("[PASS] Login - success")
        except Exception as e:
            results.append(f"[FAIL] Login - {str(e)[:50]}")
            return results
        
        # Helper function
        async def test_page(name, path, selector='.ant-card'):
            try:
                await page.goto(f"{base_url}{path}", wait_until="networkidle")
                await page.wait_for_selector(selector, timeout=10000)
                results.append(f"[PASS] {name}")
            except Exception as e:
                results.append(f"[FAIL] {name} - {str(e)[:40]}")
        
        # Test all pages
        await test_page("Home", "/")
        await test_page("Skill list", "/skill", '.ant-card')
        await test_page("Skill submit", "/skill/submit", '.ant-form')
        await test_page("Skill detail", "/skill/1", '.ant-card')
        await test_page("My Downloads", "/my-downloads")
        await test_page("My Submissions", "/my-submissions")
        await test_page("Review", "/review")
        await test_page("User Management", "/admin/users")
        await test_page("Department Management", "/admin/departments")
        await test_page("Permission Config", "/admin/permissions")
        await test_page("Project Management", "/admin/projects")
        await test_page("Category Management", "/admin/categories")
        await test_page("Operation Logs", "/admin/logs")
        await test_page("Login Logs", "/admin/login-logs")
        await test_page("Statistics", "/admin/stats")
        
        await browser.close()
    
    return results

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    print("=== Playwright Frontend E2E Test ===")
    results = asyncio.run(test_frontend())
    for r in results:
        print(r)
    
    passed = len([x for x in results if x.startswith("[PASS")])
    failed = len([x for x in results if x.startswith("[FAIL")])
    print(f"=== Result: {passed}/{len(results)} passed ===")
