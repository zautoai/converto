
export function getCountryFlagClass(countryCode: string): string {

    if (countryCode) {
        const countryCodes: { [key: string]: string } = {
            unitedstates: 'us',
            india: 'in',
            australia: 'au',
            canada: 'ca',
            unitedkingdom: 'gb',
            germany: 'de',
            france: 'fr',
            china: 'cn',
            japan: 'jp',
            southkorea: 'kr',
            brazil: 'br',
            mexico: 'mx',
            southafrica: 'za',
            italy: 'it',
            spain: 'es',
            russia: 'ru',
            netherlands: 'nl',
            sweden: 'se',
            switzerland: 'ch',
            norway: 'no'
        };

        return countryCodes[countryCode.toLowerCase()] || '';
    } else {
        return '';
    }
}