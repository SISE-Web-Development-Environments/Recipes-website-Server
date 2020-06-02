
GO
CREATE TABLE [dbo].[favorite_recipes](
	[user_id] [int] NOT NULL,
	[recipe_id][int]NOT NULL,
	PRIMARY KEY(user_id,recipe_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id)

)
GO
CREATE TABLE [dbo].[watch_reipes](
	[user_id] [int] NOT NULL,
	[recipe_id][int]NOT NULL,
	[run_watch_id] [int]NOT NULL UNIQUE,
	PRIMARY KEY(user_id,recipe_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
)
GO
CREATE TABLE [dbo].[my_recipes](
	[user_id] [int] NOT NULL,
	[recipe_id][int]NOT NULL UNIQUE,
	[recipe_name] [varchar](100) NOT NULL,
	[recipe_image][varchar](300),
	[duration] [int] NOT NULL,
	[likes] [int] NOT NULL,
	[vegan] [int] NOT NULL,
	[gluten] [int] NOT NULL,
	[ingredients_and_quantity] [varchar](8000),
	[instruction] [varchar](8000),
	[dishes] [int] NOT NULL,
	PRIMARY KEY(user_id,recipe_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
)
GO
CREATE TABLE [dbo].[family_recipes](
	[user_id] [int] NOT NULL,
	[recipe_id][int]NOT NULL UNIQUE,
	[recipe_name] [varchar](100) NOT NULL,
	[recipe_image][varchar](300),
	[owner] [varchar](100) NOT NULL,
	[duration] [int] NOT NULL,
	[recipe_event] [varchar](300) NOT NULL,
	[ingredients_and_quantity] [varchar](8000) NOT NULL,
	[instruction] [varchar](8000) NOT NULL,
	[dishes] [int] NOT NULL,
	PRIMARY KEY(user_id,recipe_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
)
GO
