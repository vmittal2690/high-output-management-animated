"""Walk every lesson: reveal and continue through each question to the finish card; capture question states."""
import asyncio
from playwright.async_api import async_playwright
U='http://localhost:8765/high-output-management/'  # serve first: python3 -m http.server 8765 -d site
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1600,'height':960})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
        for c in ['ch%02d' % i for i in range(1, 36)]:
            await pg.goto(U+c+'/index.html'); await pg.wait_for_timeout(500); await pg.keyboard.press('Space')
            asks=await pg.evaluate("BEATS.map((b,i)=>b.ask?i:-1).filter(i=>i>=0)")
            n=await pg.evaluate('BEATS.length')
            for i in asks[:-1]:
                await pg.evaluate(f'seek({i},true)'); await pg.wait_for_timeout(1800)
                qn=0
                while await pg.evaluate('P.i')==i and qn<8:
                    # wrong-ish attempt first where possible, then show the answer
                    await pg.keyboard.press('1'); await pg.wait_for_timeout(250)
                    if await pg.evaluate("!!document.querySelector('.btn.go:not([hidden])')")==False:
                        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(250)
                    if await pg.evaluate("[...document.querySelectorAll('button')].some(b=>b.textContent.startsWith('Show answer')&&!b.hidden)"):
                        await pg.keyboard.press('Escape'); await pg.keyboard.press('s'); await pg.wait_for_timeout(500)
                    if qn==0: await pg.screenshot(path=f'shots/w_{c}_{i:02d}.png')
                    await pg.keyboard.press('Enter'); await pg.wait_for_timeout(700); qn+=1
                print(c,'beat',i,'questions',qn,'now at',await pg.evaluate('P.i'))
            await pg.evaluate(f'seek({n-1},true)'); await pg.wait_for_timeout(900)
            print(c,'finish:',(await pg.inner_text('.finwrap')).replace('\n',' | ')[:160])
        await pg.goto(U+'index.html#contents'); await pg.wait_for_timeout(3000); await pg.screenshot(path='shots/contents.png')
        print('links',await pg.eval_on_selector_all('a.ch','e=>e.map(a=>a.getAttribute("href"))'),'errors',errs)
        await b.close()
asyncio.run(main())
