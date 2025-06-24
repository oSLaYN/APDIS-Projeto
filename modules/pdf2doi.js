/* Used Module PDF2DOI From: https://github.com/aeroreyna/pdf2doi */

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

let pdf2doi = { verbose: false };

pdf2doi.fromData = async function(dataBuffer) {
    let biggestHeight = 0;
    let possibleTitle = "";

    let pdfOptions = {
        version: 'v2.0.550',
        max: 1,
        pagerender: async function(pageData) {
            let render_options = {
                normalizeWhitespace: false,
                disableCombineTextItems: false
            };

            return await pageData.getTextContent(render_options)
                .then(function(textContent) {
                    let last, text = '';
                    for (let item of textContent.items) {
                        // Processamento de texto
                        if (!last || last.transform[5] === item.transform[5]) {
                            if (!last || last.transform[4] + last.width - item.transform[4] > -10) {
                                text += item.str;
                            } else {
                                text += " " + item.str;
                            }
                        } else {
                            text += '\n' + item.str;
                        }

                        // Identificação do título (texto com maior "altura")
                        if (biggestHeight < item.height) {
                            biggestHeight = item.height;
                            possibleTitle = item.str;
                        } else if (biggestHeight === item.height) {
                            possibleTitle += " " + item.str;
                        }
                        last = item;
                    }
                    return text;
                });
        }
    };

    return new Promise((resolve, reject) => {
        pdf(dataBuffer, pdfOptions).then(async (data) => {
            try {
                let doi = { doi: "", inFileDOI: "", crossRefDOI: "", title: "", authors: "" };
                
                // Extração de DOI do texto
                let doiRegex = /(10\.[0-9]{4,}(?:\.[0-9]+)*\/(?:(?![%"#? ])\S)+)/g;
                let inFileDOI = data.text.match(doiRegex);
                doi.inFileDOI = inFileDOI ? inFileDOI[0] : "";

                // Processamento das linhas do texto
                let lines = data.text.split('\n');

                // Remoção de linhas em branco no início
                let linesRemoved = 0;
                while (lines[0] && !lines[0].match(/[A-Za-z]/)) {
                    lines.shift();
                    if (++linesRemoved > 10) break; // Prevenção contra loop infinito
                }

                // Construção da string de pesquisa
                let searchString = "";
                if (lines[0] && lines[1] && lines[2] && lines[3]) {
                    let firstLineMatch = lines[0].match(/[A-Za-z]/);
                    if (firstLineMatch) {
                        lines[0] = lines[0].slice(firstLineMatch.index);
                    }
                    searchString = lines.slice(0, 4).join(" ")
                        .toLowerCase()
                        .replace(/\s+/g, ' ');
                }

                // Adição do título identificado à pesquisa
                possibleTitle = possibleTitle.toLowerCase().replace(/\s+/g, ' ');
                if (possibleTitle && searchString.indexOf(possibleTitle) === -1) {
                    searchString += " " + possibleTitle;
                }

                // Consulta ao CrossRef
                const response = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(searchString)}&rows=1`);
                const result = await response.json();

                // Verificação dos resultados
                if (!result.message.items || result.message.items.length === 0) {
                    doi.doi = doi.inFileDOI;
                    return resolve(doi);
                }

                let item = result.message.items[0];
                const crossRefTitle = item.title[0].toLowerCase();

                if (searchString.includes(crossRefTitle)) {
                    doi.title = item.title[0];
                    doi.authors = item.author;
                    doi.crossRefDOI = item.DOI;
                    doi.doi = item.DOI;
                } else {
                    doi.doi = doi.inFileDOI;
                }

                resolve(doi);

            } catch (error) {
                console.error('An Error Occurred:', error);
                reject(error);
            }
        }).catch(reject);
    });
};

pdf2doi.fromFile = async function(fileName) {
    try {
        const dataBuffer = await fs.promises.readFile(fileName);
        const data = await this.fromData(dataBuffer);
        return data
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
};

module.exports = pdf2doi;
