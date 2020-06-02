CREATE TABLE [dbo].[users](
	[user_id] [int] NOT NULL UNIQUE,
	[username] [varchar](30) NOT NULL UNIQUE,
	[password][varchar](300) NOT NULL,
	[firstName] [varchar](300) NOT NULL,
	[lastName] [varchar](300) NOT NULL,
	[country] [varchar](300) NOT NULL,
	[email] [varchar](300) NOT NULL,
	[profilePicture] [varchar](300)
)
CREATE TABLE [dbo].[users](
	[user_id] [int] NOT NULL UNIQUE,
	[username] [varchar](30) NOT NULL UNIQUE,
	[password][varchar](300) NOT NULL,
	[firstName] [varchar](300) NOT NULL,
	[lastName] [varchar](300) NOT NULL,
	[country] [varchar](300) NOT NULL,
	[email] [varchar](300) NOT NULL,
	[profilePicture] [varchar](300)
)

