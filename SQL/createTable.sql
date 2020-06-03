CREATE TABLE [dbo].[users]
(
	[user_id] [int] NOT NULL IDENTITY(1,1) UNIQUE,
	[username] [varchar](30) NOT NULL UNIQUE,
	[password][varchar](300) NOT NULL,
	[first_name] [varchar](300) NOT NULL,
	[last_name] [varchar](300) NOT NULL,
	[country] [varchar](300) NOT NULL,
	[email] [varchar](300) NOT NULL,
	[profile_image] [varchar](300),
	PRIMARY KEY (user_id,username)
)
GO
CREATE TABLE [dbo].[favorite_recipes]
(
	[user_id] [int] NOT NULL,
	[recipe_id][int] NOT NULL,
	PRIMARY KEY (user_id,recipe_id)

)
GO
CREATE TABLE [dbo].[watch_recipes]
(
	[user_id] [int] NOT NULL,
	[recipe_id][int]NOT NULL,
	[index_watch_id] [int]NOT NULL IDENTITY(1,1) UNIQUE,
	PRIMARY KEY (user_id,recipe_id)
)
GO
CREATE TABLE [dbo].[my_recipes]
(
	[user_id] [int] NOT NULL,
	[recipe_id][int]NOT NULL IDENTITY(1,1) UNIQUE,
	[recipe_name] [varchar](100) NOT NULL,
	[recipe_image][varchar](300),
	[duration] [int] NOT NULL,
	[vegan] [int] NOT NULL,
	[gluten] [int] NOT NULL,
	[ingredients_and_quantity] [varchar](8000),
	[instruction] [varchar](8000),
	[dishes] [int] NOT NULL,
	PRIMARY KEY (user_id,recipe_id)
)
GO
CREATE TABLE [dbo].[family_recipes]
(
	[user_id] [int] NOT NULL,
	[recipe_id][int]NOT NULL IDENTITY(1,1) UNIQUE,
	[recipe_name] [varchar](100) NOT NULL,
	[recipe_image][varchar](300),
	[owner] [varchar](100) NOT NULL,
	[duration] [int] NOT NULL,
	[recipe_event] [varchar](300) NOT NULL,
	[ingredients_and_quantity] [varchar](8000) NOT NULL,
	[instruction] [varchar](8000) NOT NULL,
	[dishes] [int] NOT NULL,
	PRIMARY KEY (user_id,recipe_id)
)
GO
