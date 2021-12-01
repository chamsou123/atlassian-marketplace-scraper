import { times } from 'lodash'
const ObjectsToCsv = require('objects-to-csv');

describe('Scarping Marketplace', () => {
    it('Visits The Marketlace and scarp all data to csv', () => {

        // Request the marketplace
        cy.visit('https://marketplace.atlassian.com/addons/top-rated');

        // define an empty array to hold all the apps
        let arr = [];

        /*
        Load full page by pressing load more button until all apps are showed
        */
        function expand() {
            cy.get('.css-yki7vm-AkButtonWrapper > button').find('span').then(() => {
                times(1, () => {
                    cy.get('.css-yki7vm-AkButtonWrapper > button').find('span').click({force: true});
                });
            })
        }

        /*
        - Start scraping all loaded apps
        - Assign value of 0 if rating_number or installs are undefined
        - Push app object into the array of apps
        - Remove app from Dom
        */
        function prepareData() {
            cy.get('.hits > .css-de46n9-StatelessColStyled > .css-1razftu-LargeHitContainer').each((item) => {
                let title = item.find('h3:first').text();
                let description = item.find('.css-jdzn71-Body:first span').text();
                let rating_number = item.find('.css-92dv6g:first').text();
                let installs = item.find('.css-f02hti-Installs:first').text().split(" ")[0];


                if (rating_number === "") {
                    rating_number = 0;
                } else {

                    if (rating_number[rating_number.length - 1] === "k") {
                        rating_number = Number(rating_number.replace(/k$/, ''));
                        rating_number *= 1000;
                    }
                }

                if (installs === "") {
                    installs = 0;
                } else {
                    if (installs[installs.length - 1] === "k") {
                        installs = Number(installs.replace(/k$/, ''));
                        installs *= 1000;
                    }
                }

                arr.push({
                    title: title,
                    description: description,
                    rating_number: rating_number,
                    installs: installs
                })

                item.remove();
            })
        }

        expand();

        cy.wait(10000).then(() => {
            prepareData();
        }).then(async () => {
            // Generate csv from the app array
            const csv = await new ObjectsToCsv(arr).toString();

            // Write to the csv file
            cy.writeFile('data/out.csv', csv);
        });
    })
})