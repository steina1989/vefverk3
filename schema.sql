CREATE TABLE notes (
  id serial primary key,
  datetime timestamp NOT NULL,
  title character varying(255) NOT NULL,
  text text NOT NULL
);
