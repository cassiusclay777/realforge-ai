import requests
from bs4 import BeautifulSoup
import os
import re
from urllib.parse import urljoin, urlparse

BASE_URL = "https://www.reality-proradost.cz"
LIST_URL = f"{BASE_URL}/reality/vse/?uzivatel=41"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

def sanitize_filename(name):
    return re.sub(r'[<>:"/\\|?*]', '_', name.strip())

def download_image(url, path):
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        with open(path, 'wb') as f:
            f.write(response.content)
        print(f"Staženo: {path}")
    except Exception as e:
        print(f"Chyba při stahování {url}: {e}")

def scrape_list():
    response = requests.get(LIST_URL, headers=HEADERS)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    
    properties = []
    for h2 in soup.find_all('h2'):
        a = h2.find('a')
        if a:
            title = a.get_text(strip=True)
            detail_url = urljoin(BASE_URL, a['href'])
            properties.append((title, detail_url))
    return properties

def scrape_images(detail_url, folder):
    response = requests.get(detail_url, headers=HEADERS)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    
    images = []
    # Hledej galerie: a tagy s img uvnitř, href končící .jpg (uprav podle potřeby)
    for a in soup.find_all('a', href=re.compile(r'\.jpg$')):
        img = a.find('img')
        if img:  # Jen ty s náhledem
            full_url = urljoin(BASE_URL, a['href'])
            images.append(full_url)
    
    # Stáhni
    os.makedirs(folder, exist_ok=True)
    for i, img_url in enumerate(images, 1):
        filename = f"{i:03d}.jpg"
        download_image(img_url, os.path.join(folder, filename))

if __name__ == "__main__":
    properties = scrape_list()
    print(f"Nalezeno {len(properties)} nemovitostí.")
    
    for title, detail_url in properties:
        folder = sanitize_filename(title)
        print(f"Zpracovávám: {title}")
        scrape_images(detail_url, folder)
    
    print("Hotovo. Složky jsou v aktuálním adresáři.")