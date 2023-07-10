async function pageFunction(context) {
    const { page, request, log } = context;
    const title = await page.title();
    log.info(`URL: ${request.url} TITLE: ${title}`);

    await page.type('#UserEmail', '***');
    await page.type('#UserPassword', '***');
    await page.click('#UserLoginForm input[type=submit]');
    await page.waitForLoadState('load');

    await page.waitForURL('https://shameless.sinch.cz/react/dashboard/incoming');
    log.info(`***URL: ${await page.url()} ***`);

    await page.click('a[href="/react/position"]');
    await page.waitForLoadState('load');

    await page.waitForURL('https://shameless.sinch.cz/react/position');
    log.info(`***URL: ${await page.url()} ***`);
    await page.waitForLoadState('load');

    await page.waitForTimeout(5000);

    const condition = 'tr.MuiTableRow-root:has-text("bonus"), tr.MuiTableRow-root:has-text("(1 h"), tr.MuiTableRow-root:has-text("(2 h"), tr.MuiTableRow-root:has-text("(3 h"), tr.MuiTableRow-root:has-text("(4 h"), tr.MuiTableRow-root:has-text("(5 h")';
    const conditionIds = 'tr.MuiTableRow-root:has-text("bonus") + tr td a, tr.MuiTableRow-root:has-text("(1 h") + tr td a, tr.MuiTableRow-root:has-text("(2 h") + tr td a, tr.MuiTableRow-root:has-text("(3 h") + tr td a, tr.MuiTableRow-root:has-text("(4 h") + tr td a, tr.MuiTableRow-root:has-text("(5 h") + tr td a';

    const rows = page.locator(condition);
    const rowsIds = page.locator(conditionIds);
    const shifts = [];

    const rowsCount = await rows.count();
    //log.info(`***rowsCount: ${rowsCount} ***`);

    for (var index= 0; index < rowsCount ; index++) {
        const row = await rows.nth(index);
        const rowId = await rowsIds.nth(index);

        //const innerText = await row.innerText();
        //log.info(`***Element text: ${innerText}`);
        // const innerTextIds = await rowId.innerText();
        // log.info(`---Element ID text: ${innerTextIds}`);

        try {
            const href = await rowId.getAttribute("href");

            const cells = row.locator('td');

            const nameLoc = await cells.nth(0);
            const dateLoc = await cells.nth(1);
            const timeLoc = await cells.nth(2);
            const placeLoc = await cells.nth(3);
            const roleLoc = await cells.nth(4);
            const occupancyLoc = await cells.nth(5);
            
            const unavailableLoc = await cells.nth(6).locator('svg[title*="Nespl"]');
            const unavailableCount = await unavailableLoc.count();

            if (unavailableCount < 1) {
                const singleShift = {
                    name: await nameLoc.innerText(),
                    shiftDate: await dateLoc.innerText(),
                    shiftTime: await timeLoc.innerText(),
                    place: await placeLoc.innerText(),
                    role: await roleLoc.innerText(),
                    occupancy: await occupancyLoc.innerText(), 
                    detailUrl: href           
                }
                shifts.push(singleShift);
            }
        } catch (error) {
            log.info(`***Could not parse row.`);
            log.info(`***Error: ${error}`);
        };
    }

    log.info(`***Shifts count: ${await shifts.length}`);

    return {
        shifts
    };
}