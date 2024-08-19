console.log('Website is fully loaded.');

function copyDetailsToClipboardAndCloseTab(details) {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    if (params.get('source') !== 'tts') {
        return;
    }

    const textToCopy = JSON.stringify(details);
    navigator.clipboard.writeText(textToCopy).then(() => {
        console.log("Text copied to clipboard: ");
        // Close current tab after copied successfully
        chrome.runtime.sendMessage({ action: "closeTab" });
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

switch (true) {
    case window.location.hostname.includes('etsy.com') && window.location.pathname.includes('/listing/'): {
        const details = getProductDetailsFromEtsy();
        copyDetailsToClipboardAndCloseTab(details);
        break;
    }
    case window.location.hostname.includes('amazon.com') && window.location.pathname.includes('/dp/'): {
        const details = getAmazonProductDetails();
        copyDetailsToClipboardAndCloseTab(details);
        break;
    }
    case window.location.hostname.includes('alibaba.com') && window.location.pathname.includes('/product-detail/'): {
        // const details = getAlibabaProductDetails();
        // console.log({details})
        break;
    }
    case window.location.hostname.includes('ebay.com') && window.location.pathname.includes('/itm/'): {
        const details = getEBayProductDetails();
        copyDetailsToClipboardAndCloseTab(details);
        break;
    }
    default: {
        console.log("Please go to the detail product page of Etsy, amazon, Alibaba, ebay");
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
    const videos = Array.from(document.querySelectorAll('ul video source')).map(vid => vid.src);

    return {
        productTitle: title,
        productDescription: description,
        productHighlights: highlights,
        productImages: images,
        productVideo: videos,
    };
}

function getAmazonProductDetails() {
    let title = document.getElementById('productTitle')?.innerText.trim() || "Title not found";
    let description = document.getElementById('feature-bullets')?.innerText.trim() || "Description not found";
    let images = [];

    // Collect all product images (thumbnails)
    let imageElements = document.querySelectorAll('#imgTagWrapperId img');
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

    let videoElements = document.querySelectorAll('.video-js video');
    const videos = Array.from(videoElements).map(vid => vid.src);

    return {
        productTitle: title,
        productDescription: `
            Description: ${description}.
            Detail: ${productDetails}.
            About item: ${aboutThisItem}
        `,
        productImages: images,
        productVideos: videos,
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

function getEBayProductDetails() {
    const title = document.querySelector('.x-item-title__mainTitle span')?.innerText?.trim() || 'No Title Found';

    const itemSpecifics = {};
    const specificsRows = document.querySelectorAll('dl[data-testid="ux-labels-values"]');
    specificsRows.forEach(row => {
        const labelElement = row.querySelector('dt .ux-textspans');
        const valueElement = row.querySelector('dd .ux-textspans');
        if (labelElement && valueElement) {
            const label = labelElement.textContent.trim();
            const value = valueElement.textContent.trim();
            itemSpecifics[label] = value;
        }
    });

    const cols = document.querySelectorAll('.ux-layout-section-evo__col');
    let productInfo = {};
    cols.forEach(row => {
        const labelElement = row.querySelector('.ux-labels-values__labels-content span');
        const valueElement = row.querySelector('.ux-labels-values__values-content span');
        const label = labelElement ? labelElement.textContent.trim() : null;
        const value = valueElement ? valueElement.textContent.trim() : null;
        if (label && value) {
            productInfo[label] = value;
        }
    });

    const imagesTag = document.querySelectorAll('[data-testid="ux-image-carousel-container"] img');
    const images = Array.from(imagesTag).map(imageTag => {
        if (imageTag.currentSrc) {
            return imageTag.currentSrc;
        }
        return '';
    }).filter(item => !!item);

    return { productTitle: title, itemSpecifics, productInfo, productImages: images };
}
