ALTER TABLE attractions ADD COLUMN uuid UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX attractions_uuid_idx ON attractions (uuid);
