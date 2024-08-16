console.log('Website is fully loaded.');
function copyTextToClipboard() {
    const textToCopy = "This is the text to copy"; // Thay đổi văn bản này theo ý muốn
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Text copied to clipboard: " + textToCopy);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}
switch (true) {
    case window.location.hostname.includes('etsy.com') && window.location.pathname.includes('/listing/'): {
        const details = getProductDetailsFromEtsy();
        const textToCopy = JSON.stringify(details);
        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log("Text copied to clipboard: ");

            // Close current tab after copied successfully
            chrome.runtime.sendMessage({ action: "closeTab" });
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });

        break;
    }
    case window.location.hostname.includes('amazon.com') && window.location.pathname.includes('/dp/'): {
        const details = getAmazonProductDetails();
        // todo: store to ram memory

        break;
    }
    case window.location.hostname.includes('alibaba.com') && window.location.pathname.includes('/product-detail/'): {
        console.log('Todo...');
        // return sendResponse('Todo...');
        // const details = getAlibabaProductDetails();
        // todo: store to ram memory
        // break;
    }
    default: {
        sendResponse("Please go to the detail product page of Etsy, amazon, Alibaba");
    }
}

function getProductDetailsFromEtsy() {
    const title = document.querySelector('h1[data-buy-box-listing-title]').innerText;
    // Get content from the specific <ul> tag
    const highlightsElement = document.querySelector('ul[data-selector="product-details-highlights"]');
    let highlights = [];
    if (highlightsElement) {
        highlights = Array.from(highlightsElement.querySelectorAll('li')).map(li => {
            let text = li.querySelector('.wt-ml-xs-1').innerText.trim(); // Extract the associated text
            return text;
        });
        // Note: We don't need gift wrapping available
        highlights.filter(item => !item.includes('Gift'));
    }
    const description = document.querySelector('p[data-product-details-description-text-content]').innerText;
    const images = Array.from(document.querySelectorAll('ul[data-carousel-pane-list] img')).map(img => img.src);

    return {
        title,
        highlights,
        description,
        images
    };
}

function getAmazonProductDetails() {
    let title = document.getElementById('productTitle')?.innerText.trim() || "Title not found";
    let description = document.getElementById('feature-bullets')?.innerText.trim() || "Description not found";
    let images = [];

    // Collect all product images (thumbnails)
    let imageElements = document.querySelectorAll('#altImages img');
    if (imageElements.length === 0) {
        imageElements = document.querySelectorAll('#imgTagWrapperId img');
    }
    images = Array.from(imageElements).map(img => img.src);

    // Extract "Product details" section and convert it to a paragraph
    let productDetailsArray = [];
    document.querySelectorAll('.product-facts-detail').forEach(detail => {
        let key = detail.querySelector('.a-col-left span')?.innerText.trim();
        let value = detail.querySelector('.a-col-right span')?.innerText.trim();
        if (key && value) {
            productDetailsArray.push(`${key}: ${value}`);
        }
    });
    let productDetails = productDetailsArray.join('. ') + '.';

    // Extract "About this item" section and convert it to a paragraph
    let aboutThisItemArray = [];
    document.querySelectorAll('.a-unordered-list.a-vertical.a-spacing-small li').forEach(item => {
        let text = item.innerText.trim();
        if (text) {
            aboutThisItemArray.push(text);
        }
    });
    let aboutThisItem = aboutThisItemArray.join(' ');
    return {
        title,
        description: `
            Description: ${description}.
            Detail: ${productDetails}.
            About item: ${aboutThisItem}
        `,
        images
    };
}

function getAlibabaProductDetails() {
    let title = document.querySelector('div.product-title-container h1')?.innerText.trim() || "Title not found";
    let description = document.querySelector('.product-attributes')?.innerText.trim() || "Description not found";
    let images = [];
    // Collect all product images
    let imageElements = document.querySelectorAll('.main-image-container img');
    images = Array.from(imageElements).map(img => img.src);

    return {
        title,
        description,
        images
    };
}
