describe('with the devtools service', () => {
    it('alerts should be accepted in new tabs', async() => {
        const ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf'
        const tab = await browser.createWindow('tab')
        await browser.switchToWindow(tab.handle)
        await browser.navigateTo('https://the-internet.herokuapp.com/javascript_alerts')
        const buttons = await browser.findElements('css selector', '.example button')
        let jsAlertBtn = buttons[0][ELEMENT_KEY]
        await browser.elementClick(jsAlertBtn)
        expect(await browser.getAlertText()).toBe('I am a JS Alert')
        await browser.acceptAlert()
        const result = await browser.findElement('css selector', '#result')
        expect(await browser.getElementText(result[ELEMENT_KEY])).toBe('You successfuly clicked an alert')
    })
})
