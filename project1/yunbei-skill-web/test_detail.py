import asyncio
import sys
from playwright.async_api import async_playwright

async def test_detail():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # non-headless to see
        context = await browser.new_context()
        page = await context.new_page()
        
        # Login first
        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        inputs = await page.locator('.ant-input').all()
        await inputs[0].fill('admin')
        await inputs[1].fill('admin123')
        await page.locator('.ant-btn-primary').click()
        await page.wait_for_url("**/", timeout=15000)
        
        # Go to skill detail
        await page.goto("http://localhost:5173/skill/1", wait_until="networkidle")
        
        # Wait and take screenshot
        await asyncio.sleep(3)
        await page.screenshot(path="skill_detail.png")
        
        # Check what elements exist
        content = await page.content()
        print("Page title:", await page.title())
        print("Has ant-card:", '.ant-card' in content)
        print("Has ant-descriptions:", '.ant-descriptions' in content)
        print("Has ant-table:", '.ant-table' in content)
        
        await browser.close()

asyncio.run(test_detail())
