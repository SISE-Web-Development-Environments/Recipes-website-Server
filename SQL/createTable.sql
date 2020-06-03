
CREATE TABLE [dbo].[my_recipes](
	[user_id] [int] NOT NULL,
	[recipe_id][int] IDENTITY(1,1) UNIQUE,
	[recipe_name] [varchar](100) NOT NULL,
	[recipe_image][varchar](300),
	[duration] [int] NOT NULL,
	[likes] [int] NOT NULL,
	[vegan] [int] NOT NULL,
	[gluten] [int] NOT NULL,
	[vegetarian] [int] NOT NULL,
	[ingredients_and_quantity] [varchar](8000),
	[instruction] [varchar](8000),
	[dishes] [int] NOT NULL,
	PRIMARY KEY(user_id,recipe_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
)
