-- Fix trailing hyphen in attraction slug
UPDATE attractions SET slug = 'vidikovac-ploce' WHERE slug = 'vidikovac-ploce-';
