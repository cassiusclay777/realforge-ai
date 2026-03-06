# Poski REAL Import API – referenční shrnutí

Oficiální dokumentace: **https://export-test.poskireal.cz/import/v1/** (testovací rozhraní).

## Autentizace

1. **getHash(id_client)** → vrací `sessionId` (v output).
2. **Výpočet nového session_id** před každým voláním (včetně login):
   - `var_part = md5(session_id + password + software_key)`
   - `session_id = session_id[0:48] + var_part`
3. **login(session_id)** – jediný parametr je přepočítaný session_id.
4. Před **každým** dalším voláním (addAdvert, addPhoto, …) je nutné znovu přepočítat session_id.

## Důležité metody pro export z REALFORGE

| Metoda | Parametry | Popis |
|--------|-----------|--------|
| **addAdvert** | session_id, advert_data (struct) | Vložení/editace inzerátu. Vrací advert_id, advert_url. |
| **addPhoto** | session_id, advert_id, advert_rkid, data (PhotoData) | Přidání **jedné** fotky k inzerátu. Volat po addAdvert pro každou fotku. |
| **listAdvert** | session_id | Výpis inzerátů RK. |
| **delAdvert** | session_id, advert_id, advert_rkid | Smazání inzerátu. |

## AdvertData – povinná pole (základ)

- advert_function, advert_lifetime, advert_price, advert_price_currency, advert_price_unit  
- advert_type, advert_subtype  
- title, description  
- **locality_region**, **locality_district**, **locality_city** (od 2024-01-31 povinné)  
- locality_accuracy_level, locality_inaccuracy_level  
- seller_id (nebo seller_rkid)

## PhotoData

- **data** (string): base64 fotografie (JPG).
- main (1 = hlavní, 0 = ne).
- order (pořadí).
- photo_rkid, alt (volitelné).

**Omezení:** min. 480×360 px, max 5 MB (5242880 B), max 30 fotek, formát JPG (ReturnCode 476 při neplatném formátu).

## Návratové kódy (výběr)

- 200 OK  
- 410 Obrázek je příliš velký  
- 412 Fotografie nemá dostatečné rozměry  
- 414 Překročen limit fotografií  
- 452 Nevyplněné povinné položky / špatný typ  
- 476 Neznámý typ obrázku – používejte JPG  

## Použití v projektu

- **SessionManager** už implementuje getHash → updateSessionId → login a refresh před voláním.
- **DataMapper** mapuje listing na AdvertData; doplnit **locality_district** (povinné).
- **Fotky:** `getBase64FromUrl` / `getBase64FromUrlAsync` musí vracet reálný base64 (fetch obrázku → buffer → base64). Po addAdvert volat **addPhoto** pro každou fotku (s přepočítaným session_id).
- Testovací endpoint je v projektu nastaven: `https://export-test.poskireal.cz/import/v1/`.
