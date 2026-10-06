import asyncio
from playwright.async_api import async_playwright
U='http://localhost:8765/high-output-management/'  # serve first: python3 -m http.server 8765 -d site
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1600,'height':960})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
        # cover -> contents -> chapter
        await pg.goto(U+'index.html'); await pg.wait_for_timeout(800)
        await pg.screenshot(path='shots/cover.png')
        await pg.goto(U+'index.html#contents'); await pg.wait_for_timeout(2500)
        await pg.screenshot(path='shots/contents.png')
        print('chapter links', await pg.eval_on_selector_all('a.ch','e=>e.map(a=>a.getAttribute("href"))'))
        await pg.click('a.ch'); await pg.wait_for_timeout(1200)
        print('at', pg.url)
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(9000)
        print('beat', await pg.evaluate('P.i'), 'caption', await pg.inner_text('#caption'), 'soundNote hidden', await pg.evaluate("document.getElementById('soundNote').hidden"))
        await pg.screenshot(path='shots/play.png')
        # q1: wrong then right by keyboard
        await pg.evaluate('seek(3,true)'); await pg.wait_for_timeout(2500)
        await pg.keyboard.press('ArrowLeft'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(400)
        print('wrong fb:', await pg.inner_text('.fb'))
        await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1300)
        print('right fb:', await pg.inner_text('.fb')); await pg.screenshot(path='shots/q1.png')
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1500); print('after continue beat', await pg.evaluate('P.i'))
        # grid q2
        await pg.evaluate('seek(6,true)'); await pg.wait_for_timeout(1500)
        for k in '123': await pg.keyboard.press(k)
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(500); print('grid fb:', await pg.inner_text('.fb')); await pg.screenshot(path='shots/q2.png')
        # practice + finish
        await pg.evaluate('seek(10,true)'); await pg.wait_for_timeout(1500)
        await pg.keyboard.press('2'); await pg.wait_for_timeout(300); await pg.screenshot(path='shots/prac.png')
        await pg.keyboard.press('1'); await pg.keyboard.press('Enter'); await pg.keyboard.press('2'); await pg.keyboard.press('Enter'); await pg.keyboard.press('3'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1500)
        print('finish beat', await pg.evaluate('P.i'), await pg.inner_text('.finwrap'))
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1500); print('next ->', pg.url)
        # ch02 blanks
        await pg.evaluate('seek(8,true)'); await pg.wait_for_timeout(2000)
        await pg.keyboard.type('19'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1200); print('blanks fb:', await pg.inner_text('.fb')); await pg.screenshot(path='shots/q3.png')
        await pg.click('#bHome'); await pg.wait_for_timeout(1500); print('home ->', pg.url, 'prog', await pg.inner_text('#prog'))
        print('errors', errs); await b.close()
asyncio.run(main())
