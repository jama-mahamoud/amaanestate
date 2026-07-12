import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';

// Legacy flat translations (as backup and direct string fallbacks)
const legacyTranslations = {
  en: {
    "properties.houses": "Houses",
    "properties.apartments": "Apartments",
    "properties.land": "Land & Plots",
    "properties.commercial": "Commercial Spaces",
    "properties.villas": "Villas & Estates",
    "properties.luxuryHomes": "Luxury Homes",
    "vehicles.suvs": "SUVs",
    "vehicles.sedans": "Sedans",
    "vehicles.trucks": "Trucks",
    "vehicles.luxury": "Luxury Vehicles",
    "agents.verifiedBrokers": "Verified Brokers",
    "agents.agencies": "Agencies Office",
    "agents.propertyExperts": "Property Experts",
    "agents.registryVerification": "Registry Verification",
    "agents.certifiedAgents": "Certified Agents",
    "footer.brandSlogan": "Global Real Estate & Structural Verification Network",
    "footer.brandDescription": "Pioneering absolute transactional security and asset compliance. Establishing state-of-the-art cataloging, certified ownership validation, and luxury asset exchange systems across East Africa.",
    "footer.ctaSub": "Catalog Your Premium Asset",
    "footer.ctaTitle": "Ready to reach East Africa's premier buyers?",
    "footer.poweredBy": "Powered by",
    "footer.networkName": "AmaanEstate Global Property Network",
    "Home": "Home",
    "Properties": "Properties",
    "Vehicles": "Vehicles",
    "Jobs": "Jobs",
    "Academy": "Academy",
    "Professionals": "Professionals",
    "About": "About",
    "Contact": "Contact",
    "Disclaimer": "Disclaimer",
    "Browse Properties": "Browse Properties",
    "Menu": "Menu",
    "Language": "Language",
    "Currency": "Currency",
    "Switch to Dark": "Switch to Dark",
    "Switch to Light": "Switch to Light",
    "My Dashboard": "My Dashboard",
    "Account": "Account",
    "Login": "Login",
    "Sign In": "Sign In",
    "Join Us": "Join Us",
    "Residential": "Residential",
    "Houses": "Houses",
    "Apartments": "Apartments",
    "Villas": "Villas",
    "Commercial": "Commercial",
    "Land": "Land",
    "Offices": "Offices",
    "Warehouses": "Warehouses",
    "Rental": "Rental",
    "Rentals": "Rentals",
    "Furnished": "Furnished",
    "Cars": "Cars",
    "SUVs": "SUVs",
    "Trucks": "Trucks",
    "Motorcycles": "Motorcycles",
    "Heavy Machinery": "Heavy Machinery",
    "Legal Experts": "Legal Experts",
    "Valuators": "Valuators",
    "Consultants": "Consultants",
    "Brokers": "Brokers",
    "WhatsApp Support": "WhatsApp Support",
    "EN": "EN",
    "SOM": "SOM",
    "USD": "USD",
    "ETB": "ETB",
    
    // Agreements page translations
    "Agreement Registry & Legal Documentation": "Agreement Registry & Legal Documentation",
    "Create, preview, print, and submit secure legal agreements for verification on AmaanEstate.": "Create, preview, print, and submit secure legal agreements for verification on AmaanEstate.",
    "STEP 1 - Selecting Agreement Scheme": "STEP 1 - Selecting Agreement Scheme",
    "Select Agreement Type": "Select Agreement Type",
    "Property Sale Agreement": "Property Sale Agreement",
    "Property Rental Agreement": "Property Rental Agreement",
    "Vehicle Sale Agreement": "Vehicle Sale Agreement",
    "Vehicle Rental Agreement": "Vehicle Rental Agreement",
    "Broker Commission Agreement": "Broker Commission Agreement",
    "Agreement Covenant Details": "Agreement Covenant Details",
    "Section D: Subject Asset Specifications": "Section D: Subject Asset Specifications",
    "Section E: Covenant Legal Clauses": "Section E: Covenant Legal Clauses",
    "Agreement Title *": "Agreement Title *",
    "Deed Transaction Date *": "Deed Transaction Date *",
    "Currency Unit *": "Currency Unit *",
    "Default Asset Price Type *": "Default Asset Price Type *",
    "Party A (Grantor / Owner)": "Party A (Grantor / Owner)",
    "Full Legal Name *": "Full Legal Name *",
    "Contact Phone *": "Contact Phone *",
    "Email Address": "Email Address",
    "National ID Card Number": "National ID Card Number",
    "Domicile / Address *": "Domicile / Address *",
    "Party A Binding Endorsement Signature": "Party A Binding Endorsement Signature",
    "Party B Binding Endorsement Signature": "Party B Binding Endorsement Signature",
    "Witness Verification Section": "Witness Verification Section",
    "Witness 1": "Witness 1",
    "Witness 2": "Witness 2",
    "Witness 3": "Witness 3",
    "Witness 1 Full Name *": "Witness 1 Full Name *",
    "Witness 2 Full Name *": "Witness 2 Full Name *",
    "Witness 3 Full Name *": "Witness 3 Full Name *",
    "Witness 1 Binding Endorsement Signature": "Witness 1 Binding Endorsement Signature",
    "Witness 2 Binding Endorsement Signature": "Witness 2 Binding Endorsement Signature",
    "Witness 3 Binding Endorsement Signature": "Witness 3 Binding Endorsement Signature",
    "Witnesses": "Witnesses",
    "Witness 1: Full Name + Signature": "Witness 1: Full Name + Signature",
    "Witness 2: Full Name + Signature": "Witness 2: Full Name + Signature",
    "Witness 3: Full Name + Signature": "Witness 3: Full Name + Signature",
    "Witness 1 must type in their binding signature name.": "Witness 1 must type in their binding signature name.",
    "Witness 2 must type in their binding signature name.": "Witness 2 must type in their binding signature name.",
    "Witness 3 must type in their binding signature name.": "Witness 3 must type in their binding signature name.",
    "Type Witness 1 Full Name *": "Type Witness 1 Full Name *",
    "Type Witness 2 Full Name *": "Type Witness 2 Full Name *",
    "Type Witness 3 Full Name *": "Type Witness 3 Full Name *",
    "Type Signature": "Type Signature",
    "Draw Signature": "Draw Signature",
    "Type Full Name for Digital Script *": "Type Full Name for Digital Script *",
    "Type name here (e.g. Abdirahman Yusuf)": "Type name here (e.g. Abdirahman Yusuf)",
    "Type name here (e.g. Halima Ahmed)": "Type name here (e.g. Halima Ahmed)",
    "Draw inside the dark pad below": "Draw inside the dark pad below",
    "Reset Canvas": "Reset Canvas",
    "Party B (Grantee / Client)": "Party B (Grantee / Client)",
    "Property Code / Identifier": "Property Code / Identifier",
    "Property Name / Core Title *": "Property Name / Core Title *",
    "Category Range": "Category Range",
    "Structure Form (Apartment, Land Plot, etc)": "Structure Form (Apartment, Land Plot, etc)",
    "Metropolis City *": "Metropolis City *",
    "Administrative District": "Administrative District",
    "Exchange Valuation Price ({currency}) *": "Exchange Valuation Price ({currency}) *",
    "Payment Instalments / Terms Description": "Payment Instalments / Terms Description",
    "Covenant Stipulations *": "Covenant Stipulations *",
    "Vehicle ID / Chassis Ref": "Vehicle ID / Chassis Ref",
    "Automobile Manufacturer (Make) *": "Automobile Manufacturer (Make) *",
    "Model Name *": "Model Name *",
    "Production Year": "Production Year",
    "Official License Plate *": "Official License Plate *",
    "Agreed Car Valuation Price ({currency}) *": "Agreed Car Valuation Price ({currency}) *",
    "Broker Commission Terms & Compensations *": "Broker Commission Terms & Compensations *",
    "e.g. Abdirahman Yusuf": "e.g. Abdirahman Yusuf",
    "e.g. Halima Ahmed": "e.g. Halima Ahmed",
    "e.g. +252 61 5XXXXXX": "e.g. +252 61 5XXXXXX",
    "e.g. +252 61 7XXXXXX": "e.g. +252 61 7XXXXXX",
    "e.g. partyA@example.com": "e.g. partyA@example.com",
    "e.g. partyB@example.com": "e.g. partyB@example.com",
    "e.g. NID-842719": "e.g. NID-842719",
    "e.g. NID-108259": "e.g. NID-108259",
    "e.g. Mogadishu Airport Zone, Wadajir, Somalia": "e.g. Mogadishu Airport Zone, Wadajir, Somalia",
    "e.g. Hodan District, Mogadishu, Somalia": "e.g. Hodan District, Mogadishu, Somalia",
    "e.g. AP-94021": "e.g. AP-94021",
    "e.g. Luxury Penthouse Suite B-2": "e.g. Luxury Penthouse Suite B-2",
    "e.g. Duplex Villa": "e.g. Duplex Villa",
    "e.g. Mogadishu": "e.g. Mogadishu",
    "e.g. Hodan": "e.g. Hodan",
    "e.g. 185000": "e.g. 185000",
    "e.g. 30% Down, 70% Bank Escrow Transfer": "e.g. 30% Down, 70% Bank Escrow Transfer",
    "e.g. CHASSIS-N028741": "e.g. CHASSIS-N028741",
    "e.g. Toyota": "e.g. Toyota",
    "e.g. Land Cruiser": "e.g. Land Cruiser",
    "e.g. JUBALAND-840": "e.g. JUBALAND-840",
    "e.g. 52000": "e.g. 52000",
    "Provide description of broker duties, affiliated real estate listings, payment percentages, and conditional terms...": "Provide description of broker duties, affiliated real estate listings, payment percentages, and conditional terms...",
    "Cancel": "Cancel",
    "Preview Agreement": "Preview Agreement",
    "Download QR Code": "Download QR Code",
    "Submit for Approval": "Submit for Approval",
    "Back to Edit": "Back to Edit",
    "Print": "Print",
    "Download PDF": "Download PDF",
    "Verification Constraints Required:": "Verification Constraints Required:",
    "Submitted Successfully": "Submitted Successfully",
    "Status: Pending Approval": "Status: Pending Approval",
    "System Record Registered": "System Record Registered",
    "Agreement Record ID": "Agreement Record ID",
    "Audit Track Status": "Audit Track Status",
    "Pending Officer Review": "Pending Officer Review",
    "Your legal agreement documents have been logged securely. You can direct the municipal administration division or real estate desk in charge of verification to sign off using the administrator console.": "Your legal agreement documents have been logged securely. You can direct the municipal administration division or real estate desk in charge of verification to sign off using the administrator console.",
    "Go to Dashboard": "Go to Dashboard",
    "Draft Another Agreement": "Draft Another Agreement",
    "Cursive Representation": "Cursive Representation",
    "Vectored path captured. Ready to bind.": "Vectored path captured. Ready to bind.",
    "DRAFT DOCUMENT - PREVIEW STATE": "DRAFT DOCUMENT - PREVIEW STATE",
    "LEDGER REGISTRY DEED": "LEDGER REGISTRY DEED",
    "Provisional Draft": "Provisional Draft",
    "Witnessed & Logged on the secure AmaanEstate Administrative Grid on:": "Witnessed & Logged on the secure AmaanEstate Administrative Grid on:",
    "I. Contract Category Specifications": "I. Contract Category Specifications",
    "Deed Scheme Type:": "Deed Scheme Type:",
    "Current Valuation Total:": "Current Valuation Total:",
    "II. Contracting Sovereign Parties": "II. Contracting Sovereign Parties",
    "PARTY A (Grantor/Seller)": "PARTY A (Grantor/Seller)",
    "PARTY B (Grantee/Client)": "PARTY B (Grantee/Client)",
    "Name:": "Name:",
    "Phone:": "Phone:",
    "Email:": "Email:",
    "Registry ID No:": "Registry ID No:",
    "Domicile:": "Domicile:",
    "III. Object Asset Specifications": "III. Object Asset Specifications",
    "Property Unique ID:": "Property Unique ID:",
    "Property Title/Lodge:": "Property Title/Lodge:",
    "Covenant Status:": "Covenant Status:",
    "Structure Specification:": "Structure Specification:",
    "Metropolis City:": "Metropolis City:",
    "District Address:": "District Address:",
    "Vehicle Tracker No:": "Vehicle Tracker No:",
    "Automobile Maker:": "Automobile Maker:",
    "Model / Specific:": "Model / Specific:",
    "Manufacturing Year:": "Manufacturing Year:",
    "Registration Plate:": "Registration Plate:",
    "IV. General Legal Covenants & Assurances": "IV. General Legal Covenants & Assurances",
    "V. Binding Endorsements & Proof of Intent": "V. Binding Endorsements & Proof of Intent",
    "PARTY A SIGNATURE": "PARTY A SIGNATURE",
    "PARTY B SIGNATURE": "PARTY B SIGNATURE",
    "Blank Drawn Signature": "Blank Drawn Signature",
    "VI. Digital Registry Ledger Verification": "VI. Digital Registry Ledger Verification",
    "Deed Record ID:": "Deed Record ID:",
    "Contract Number:": "Contract Number:",
    "Registered Date:": "Registered Date:",
    "Verification Scheme:": "Verification Scheme:",
    "AmaanEstate Secured Cryptographic Ledger": "AmaanEstate Secured Cryptographic Ledger",
    "Provisional Registry (Pending Approval)": "Provisional Registry (Pending Approval)",
    "Agreement Title is required.": "Agreement Title is required.",
    "Party A (Seller/Owner) Full Name is required.": "Party A (Seller/Owner) Full Name is required.",
    "Party A Contact Phone is required.": "Party A Contact Phone is required.",
    "Party B (Buyer/Tenant) Full Name is required.": "Party B (Buyer/Tenant) Full Name is required.",
    "Party B Contact Phone is required.": "Party B Contact Phone is required.",
    "Property Name/Title is required.": "Property Name/Title is required.",
    "Property City is required.": "Property City is required.",
    "A valid property valuation price is required.": "A valid property valuation price is required.",
    "Vehicle Automobile Make and Model are required.": "Vehicle Automobile Make and Model are required.",
    "Vehicle License Plate is required.": "Vehicle License Plate is required.",
    "A valid vehicle transaction price is required.": "A valid vehicle transaction price is required.",
    "Broker Details / Commission Terms cannot be blank.": "Broker Details / Commission Terms cannot be blank.",
    "Party A must type in their binding signature name.": "Party A must type in their binding signature name.",
    "Party B must type in their binding signature name.": "Party B must type in their binding signature name.",
    "Review and alter standard legal protections directly inside the document. Ensure exact payment deadlines and breach guidelines are specified according to local commerce bylaws.": "Review and alter standard legal protections directly inside the document. Ensure exact payment deadlines and breach guidelines are specified according to local commerce bylaws."
  },
  so: {
    "properties.houses": "Houses",
    "properties.apartments": "Apartments",
    "properties.land": "Land & Plots",
    "properties.commercial": "Commercial Spaces",
    "properties.villas": "Villas & Estates",
    "properties.luxuryHomes": "Luxury Homes",
    "vehicles.suvs": "SUVs",
    "vehicles.sedans": "Sedans",
    "vehicles.trucks": "Trucks",
    "vehicles.luxury": "Luxury Vehicles",
    "agents.verifiedBrokers": "Verified Brokers",
    "agents.agencies": "Agencies Office",
    "agents.propertyExperts": "Property Experts",
    "agents.registryVerification": "Registry Verification",
    "agents.certifiedAgents": "Certified Agents",
    "footer.brandSlogan": "Global Real Estate & Structural Verification Network",
    "footer.brandDescription": "Pioneering absolute transactional security and asset compliance. Establishing state-of-the-art cataloging, certified ownership validation, and luxury asset exchange systems across East Africa.",
    "footer.ctaSub": "Catalog Your Premium Asset",
    "footer.ctaTitle": "Ready to reach East Africa's premier buyers?",
    "footer.poweredBy": "Powered by",
    "footer.networkName": "AmaanEstate Global Property Network",
    "Home": "Home",
    "Properties": "Properties",
    "Vehicles": "Automobiles",
    "Jobs": "Careers",
    "Academy": "Academy",
    "Professionals": "Professionals",
    "About": "About",
    "Contact": "Contact",
    "Disclaimer": "Disclaimer",
    "Browse Properties": "Browse Properties",
    "Menu": "Menu",
    "Language": "Language",
    "Currency": "Currency",
    "Switch to Dark": "Switch to Dark",
    "Switch to Light": "Switch to Light",
    "My Dashboard": "My Dashboard",
    "Account": "Account",
    "Login": "Sign In",
    "Sign In": "Sign In",
    "Join Us": "Join Us",
    "Residential": "Residential",
    "Commercial": "Commercial",
    "Rental": "Rental",
    "Apartments": "Apartments",
    "Villas": "Villas",
    "Land": "Land",
    "Offices": "Offices",
    "Warehouses": "Warehouses",
    "Rentals": "Rentals",
    "Furnished": "Furnished",
    "Cars": "Cars",
    "SUVs": "SUVs",
    "Trucks": "Trucks",
    "Motorcycles": "Motorcycles",
    "Heavy Machinery": "Heavy Machinery",
    "Legal Experts": "Legal Experts",
    "Valuators": "Valuators",
    "Consultants": "Consultants",
    "Brokers": "Brokers",
    "WhatsApp Support": "WhatsApp Support",
    "EN": "EN",
    "SOM": "SOM",
    "USD": "USD",
    "ETB": "ETB",
    
    // Agreements page translations
    "Agreement Registry & Legal Documentation": "Agreement Registry & Legal Documentation",
    "Create, preview, print, and submit secure legal agreements for verification on AmaanEstate.": "Create, preview, print, and submit secure legal agreements for verification on AmaanEstate.",
    "STEP 1 - Selecting Agreement Scheme": "STEP 1 - Selecting Agreement Scheme",
    "Select Agreement Type": "Select Agreement Type",
    "Property Sale Agreement": "Property Sale Agreement",
    "Property Rental Agreement": "Property Rental Agreement",
    "Vehicle Sale Agreement": "Vehicle Sale Agreement",
    "Vehicle Rental Agreement": "Vehicle Rental Agreement",
    "Broker Commission Agreement": "Broker Commission Agreement",
    "Agreement Covenant Details": "Agreement Covenant Details",
    "Section D: Subject Asset Specifications": "Section D: Subject Asset Specifications",
    "Section E: Covenant Legal Clauses": "Section E: Covenant Legal Clauses",
    "Agreement Title *": "Agreement Title *",
    "Deed Transaction Date *": "Deed Transaction Date *",
    "Currency Unit *": "Currency Unit *",
    "Default Asset Price Type *": "Default Asset Price Type *",
    "Party A (Grantor / Owner)": "Party A (Party A (Grantor / Owner))",
    "Full Legal Name *": "Full Legal Name *",
    "Contact Phone *": "Contact Phone *",
    "Email Address": "Email Address",
    "National ID Card Number": "National ID Card Number",
    "Domicile / Address *": "Domicile / Address *",
    "Party A Binding Endorsement Signature": "Party A Binding Endorsement Signature",
    "Party B Binding Endorsement Signature": "Party B Binding Endorsement Signature",
    "Witness Verification Section": "Witness Verification Section",
    "Witness 1": "Witness 1",
    "Witness 2": "Witness 2",
    "Witness 3": "Witness 3",
    "Witness 1 Full Name *": "Witness 1 Full Name *",
    "Witness 2 Full Name *": "Witness 2 Full Name *",
    "Witness 3 Full Name *": "Witness 3 Full Name *",
    "Witness 1 Binding Endorsement Signature": "Witness 1 Binding Endorsement Signature",
    "Witness 2 Binding Endorsement Signature": "Witness 2 Binding Endorsement Signature",
    "Witness 3 Binding Endorsement Signature": "Witness 3 Binding Endorsement Signature",
    "Witnesses": "Witnesses",
    "Witness 1: Full Name + Signature": "Witness 1: Full Name + Signature",
    "Witness 2: Full Name + Signature": "Witness 2: Full Name + Signature",
    "Witness 3: Full Name + Signature": "Witness 3: Full Name + Signature",
    "Witness 1 must type in their binding signature name.": "Witness 1 must type in their binding signature name.",
    "Witness 2 must type in their binding signature name.": "Witness 2 must type in their binding signature name.",
    "Witness 3 must type in their binding signature name.": "Witness 3 must type in their binding signature name.",
    "Type Witness 1 Full Name *": "Type Witness 1 Full Name *",
    "Type Witness 2 Full Name *": "Type Witness 2 Full Name *",
    "Type Witness 3 Full Name *": "Type Witness 3 Full Name *",
    "Type Signature": "Type Signature",
    "Draw Signature": "Draw Signature",
    "Type Full Name for Digital Script *": "Type Full Name for Digital Script *",
    "Type name here (e.g. Abdirahman Yusuf)": "Type name here (e.g. Abdirahman Yusuf)",
    "Type name here (e.g. Halima Ahmed)": "Type name here (e.g. Halima Ahmed)",
    "Draw inside the dark pad below": "Draw inside the dark pad below",
    "Reset Canvas": "Reset Canvas",
    "Party B (Grantee / Client)": "Party B (Grantee / Client)",
    "Property Code / Identifier": "Property Code / Identifier",
    "Property Name / Core Title *": "Property Name / Core Title *",
    "Category Range": "Category Range",
    "Structure Form (Apartment, Land Plot, etc)": "Structure Form (Apartment, Land Plot, etc)",
    "Metropolis City *": "Metropolis City *",
    "Administrative District": "Administrative District",
    "Exchange Valuation Price ({currency}) *": "Exchange Valuation Price ({currency}) *",
    "Payment Instalments / Terms Description": "Payment Instalments / Terms Description",
    "Covenant Stipulations *": "Covenant Stipulations *",
    "Vehicle ID / Chassis Ref": "Vehicle ID / Chassis Ref",
    "Automobile Manufacturer (Make) *": "Automobile Manufacturer (Make) *",
    "Model Name *": "Model Name *",
    "Production Year": "Production Year",
    "Official License Plate *": "Official License Plate *",
    "Agreed Car Valuation Price ({currency}) *": "Agreed Car Valuation Price ({currency}) *",
    "Broker Commission Terms & Compensations *": "Broker Commission Terms & Compensations *",
    "e.g. Abdirahman Yusuf": "e.g. Abdirahman Yusuf",
    "e.g. Halima Ahmed": "e.g. Halima Ahmed",
    "e.g. +252 61 5XXXXXX": "e.g. +252 61 5XXXXXX",
    "e.g. +252 61 7XXXXXX": "e.g. +252 61 7XXXXXX",
    "e.g. partyA@example.com": "e.g. partyA@example.com",
    "e.g. partyB@example.com": "e.g. partyB@example.com",
    "e.g. NID-842719": "e.g. NID-842719",
    "e.g. NID-108259": "e.g. NID-108259",
    "e.g. Mogadishu Airport Zone, Wadajir, Somalia": "e.g. Mogadishu Airport Zone, Wadajir, Somalia",
    "e.g. Hodan District, Mogadishu, Somalia": "e.g. Hodan District, Mogadishu, Somalia",
    "e.g. AP-94021": "e.g. AP-94021",
    "e.g. Luxury Penthouse Suite B-2": "e.g. Luxury Penthouse Suite B-2",
    "e.g. Duplex Villa": "e.g. Duplex Villa",
    "e.g. Mogadishu": "e.g. Mogadishu",
    "e.g. Hodan": "e.g. Hodan",
    "e.g. 185000": "e.g. 185000",
    "e.g. 30% Down, 70% Bank Escrow Transfer": "e.g. 30% Down, 70% Bank Escrow Transfer",
    "e.g. CHASSIS-N028741": "e.g. CHASSIS-N028741",
    "e.g. Toyota": "e.g. Toyota",
    "e.g. Land Cruiser": "e.g. Land Cruiser",
    "e.g. JUBALAND-840": "e.g. JUBALAND-840",
    "e.g. 52000": "e.g. 52000",
    "Provide description of broker duties, affiliated real estate listings, payment percentages, and conditional terms...": "Provide description of broker duties, affiliated real estate listings, payment percentages, and conditional terms...",
    "Cancel": "Cancel",
    "Preview Agreement": "Preview Agreement",
    "Download QR Code": "Download QR Code",
    "Submit for Approval": "Submit for Approval",
    "Back to Edit": "Back to Edit",
    "Print": "Print",
    "Download PDF": "Download PDF",
    "Verification Constraints Required:": "Verification Constraints Required:",
    "Submitted Successfully": "Submitted Successfully",
    "Status: Pending Approval": "Status: Pending Approval",
    "System Record Registered": "System Record Registered",
    "Agreement Record ID": "Agreement Record ID",
    "Audit Track Status": "Audit Track Status",
    "Pending Officer Review": "Pending Officer Review",
    "Your legal agreement documents have been logged securely. You can direct the municipal administration division or real estate desk in charge of verification to sign off using the administrator console.": "Your legal agreement documents have been logged securely. You can direct the municipal administration division or real estate desk in charge of verification to sign off using the administrator console.",
    "Go to Dashboard": "Go to Dashboard",
    "Draft Another Agreement": "Draft Another Agreement",
    "Cursive Representation": "Cursive Representation",
    "Vectored path captured. Ready to bind.": "Vectored path captured. Ready to bind.",
    "DRAFT DOCUMENT - PREVIEW STATE": "DRAFT DOCUMENT - PREVIEW STATE",
    "LEDGER REGISTRY DEED": "LEDGER REGISTRY DEED",
    "Provisional Draft": "Provisional Draft",
    "Witnessed & Logged on the secure AmaanEstate Administrative Grid on:": "Witnessed & Logged on the secure AmaanEstate Administrative Grid on:",
    "I. Contract Category Specifications": "I. Contract Category Specifications",
    "Deed Scheme Type:": "Deed Scheme Type:",
    "Current Valuation Total:": "Current Valuation Total:",
    "II. Contracting Sovereign Parties": "II. Contracting Sovereign Parties",
    "PARTY A (Grantor/Seller)": "PARTY A (Grantor/Seller)",
    "PARTY B (Grantee/Client)": "PARTY B (Grantee/Client)",
    "Name:": "Name:",
    "Phone:": "Phone:",
    "Email:": "Email:",
    "Registry ID No:": "Registry ID No:",
    "Domicile:": "Domicile:",
    "III. Object Asset Specifications": "III. Object Asset Specifications",
    "Property Unique ID:": "Property Unique ID:",
    "Property Title/Lodge:": "Property Title/Lodge:",
    "Covenant Status:": "Covenant Status:",
    "Structure Specification:": "Structure Specification:",
    "Metropolis City:": "Metropolis City:",
    "District Address:": "District Address:",
    "Vehicle Tracker No:": "Vehicle Tracker No:",
    "Automobile Maker:": "Automobile Maker:",
    "Model / Specific:": "Model / Specific:",
    "Manufacturing Year:": "Manufacturing Year:",
    "Registration Plate:": "Registration Plate:",
    "IV. General Legal Covenants & Assurances": "IV. General Legal Covenants & Assurances",
    "V. Binding Endorsements & Proof of Intent": "V. Binding Endorsements & Proof of Intent",
    "PARTY A SIGNATURE": "PARTY A SIGNATURE",
    "PARTY B SIGNATURE": "PARTY B SIGNATURE",
    "Blank Drawn Signature": "Blank Drawn Signature",
    "VI. Digital Registry Ledger Verification": "VI. Digital Registry Ledger Verification",
    "Deed Record ID:": "Deed Record ID:",
    "Contract Number:": "Contract Number:",
    "Registered Date:": "Registered Date:",
    "Verification Scheme:": "Verification Scheme:",
    "AmaanEstate Secured Cryptographic Ledger": "AmaanEstate Secured Cryptographic Ledger",
    "Provisional Registry (Pending Approval)": "Provisional Registry (Pending Approval)",
    "Agreement Title is required.": "Agreement Title is required.",
    "Party A (Seller/Owner) Full Name is required.": "Party A (Seller/Owner) Full Name is required.",
    "Party A Contact Phone is required.": "Party A Contact Phone is required.",
    "Party B (Buyer/Tenant) Full Name is required.": "Party B (Buyer/Tenant) Full Name is required.",
    "Party B Contact Phone is required.": "Party B Contact Phone is required.",
    "Property Name/Title is required.": "Property Name/Title is required.",
    "Property City is required.": "Property City is required.",
    "A valid property valuation price is required.": "A valid property valuation price is required.",
    "Vehicle Automobile Make and Model are required.": "Vehicle Automobile Make and Model are required.",
    "Vehicle License Plate is required.": "Vehicle License Plate is required.",
    "A valid vehicle transaction price is required.": "A valid vehicle transaction price is required.",
    "Broker Details / Commission Terms cannot be blank.": "Broker Details / Commission Terms cannot be blank.",
    "Party A must type in their binding signature name.": "Party A must type in their binding signature name.",
    "Party B must type in their binding signature name.": "Party B must type in their binding signature name.",
    "Review and alter standard legal protections directly inside the document. Ensure exact payment deadlines and breach guidelines are specified according to local commerce bylaws.": "Review and alter standard legal protections directly inside the document. Ensure exact payment deadlines and breach guidelines are specified according to local commerce bylaws."
  },
};

const flattenTranslations = (obj: any, prefix = '', res: Record<string, string> = {}) => {
  if (!obj) return res;
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        flattenTranslations(obj[k], path, res);
      } else {
        res[path] = obj[k];
        // Merge direct simple keys if they don't exist yet, to support legacy verbatim lookup
        if (!res[k]) {
          res[k] = obj[k];
        }
      }
    }
  }
  return res;
};

// Merged static & dynamic configurations
const mergedEn = {
  ...legacyTranslations.en,
  ...flattenTranslations(enTranslations)
};

const translations = {
  en: mergedEn
};

type Language = 'en' | 'so';
type Currency = 'ETB' | 'USD';

interface SettingsContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string, fallback?: string) => string;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      return (localStorage.getItem('pd_currency') as Currency) || 'USD';
    } catch (e) {
      console.warn("Storage access failed:", e);
      return 'ETB';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pd_language', language);
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('pd_currency', currency);
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  }, [currency]);

  const t = (key: string, fallback?: string) => {
    if (!key) return '';
    const currentLangDict = translations[language] as Record<string, string>;
    
    // 1. Direct or nested key match (e.g., "common.home" or legacy verbatim "Home")
    if (currentLangDict[key]) {
      return currentLangDict[key];
    }
    
    // 2. Fall back to search case-insensitive or trimmed in direct dictionary
    const lowercaseKey = key.toLowerCase().trim();
    for (const dictKey in currentLangDict) {
      if (dictKey.toLowerCase() === lowercaseKey) {
        return currentLangDict[dictKey];
      }
    }

    // 3. Fall back to english database flat search
    const englishLangDict = translations['en'] as Record<string, string>;
    if (englishLangDict[key]) {
      return englishLangDict[key];
    }

    // 4. If key is missing, look at fallback parameter
    if (fallback) {
      return fallback;
    }

    // 5. Fallback prettifier for dots
    if (key.includes('.')) {
      const parts = key.split('.');
      const last = parts[parts.length - 1];
      return last.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
    }

    // 6. Return original key as final fail-safe
    return key;
  };

  return (
    <SettingsContext.Provider value={{ language, currency, setLanguage, setCurrency, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
