import time
import operator
import requests
import threading
from time import sleep
from lxml import html
from database.sku_dao import SkuDao
from lazada_api.lazada_sku_api import LazadaSkuApi
from managers.sku_manager import SkuManager

skudao = SkuDao()
skuManager = SkuManager()
lazadaSkuApi = LazadaSkuApi()

class AutoPriceWorker(threading.Thread):

	def __init__(self, kwargs):
		threading.Thread.__init__(self)
		self.kwargs = kwargs

	def run(self):
		user = self.kwargs['user']
		print('''*********** {}: is running ***********'''.format(user['lazada_user_name']))
		skus = skudao.getActiveSku(user)
		if (skus == None):
			return

		for sku in skus:
			enemies = self.getEnemies(user, sku)
			self.priceAlgorithm(enemies, user, sku)

	#-----------------------------------------------------------------------------
	# Auto price worker's algorithm
	#-----------------------------------------------------------------------------
	def priceAlgorithm(self, enemies, user, sku):
		newSpecialPrice = sku['special_price']
		if (enemies == None or len(enemies) <= 1):
			return

		# Get enemy have lowest price
		enemies = self.sortEnemies(enemies)
		lowestPriceEnemy = enemies[0]
		lowSecondPriceEnemy = enemies[1]

		# Our product price will be lower then enemy compete_price unit
		newSpecialPrice = lowestPriceEnemy['price'] - sku['compete_price']
		if (user['lazada_user_name'].lower() == lowestPriceEnemy['name'].lower()):
			# Improved: Should update our special price up to under next enemy's price.
			newSpecialPrice = lowSecondPriceEnemy['price'] - sku['compete_price']

		# But this is not lower then min_price and higher then max_price
		if (newSpecialPrice < sku['min_price']):
			newSpecialPrice = sku['min_price']
		if (newSpecialPrice > sku['max_price']):
			newSpecialPrice = sku['max_price']

		# Prevent update multiple time
		if (sku['special_price'] == newSpecialPrice):
			return

		self.doUpdatePriceAndAddHistory(sku, user, enemies, newSpecialPrice)

	#-----------------------------------------------------------------------------
	# Task list
	# 1. Update product special price on lazada
	# 2. Update internal product price
	# 3. Add history
	#-----------------------------------------------------------------------------
	def doUpdatePriceAndAddHistory(self, sku, user, enemies, newSpecialPrice):
		sku['updated_at'] = int(round(time.time()))
		sku['special_price'] = newSpecialPrice

		# Update product special price on lazada
		lazadaProduct = lazadaSkuApi.updateProductSpecialPrice(sku, user, newSpecialPrice)
		if 'error' in lazadaProduct:
			# Add filed history
			skuManager.insertHistory(sku, enemies, user, 1) 	# 1 is marked that we can't update special price on lazada
			print ('''{} ({}): {}, Special price: {}'''.format(sku['sku'], user['lazada_user_name'], lazadaProduct['error'], newSpecialPrice))
			return

		# Update internal product price
		skuDao.updateSpecialPrice(sku)
		# Add success history
		skuManager.insertHistory(sku, enemies, user, 0) 		# 0 is marked that we updated special price successful
		print ('''{} ({}): updated price to: {}'''.format(sku['sku'], user['lazada_user_name'], newSpecialPrice))

	#-----------------------------------------------------------------------------
	# Get enemies
	#-----------------------------------------------------------------------------
	def getEnemies(self, user, sku):
		try:
			enemiesJson = []
			page = requests.get(sku['link'])
			tree = html.fromstring(page.content)

			# Top enemy, will be this user if the user is on the top
			topEnemyPrice = tree.xpath('//*[@id="special_price_box"]/text()')
			topEnemyName = tree.xpath('//*[@id="prod_content_wrapper"]/div[2]/div[2]/div[1]/div[1]/a/text()')
			if topEnemyName != None and len(topEnemyName) > 0 and topEnemyPrice != None and len(topEnemyPrice) > 0:
				topEnemyJson = {
					"name": topEnemyName[0].replace(' ','').replace('\n', ''),
					"price": int(topEnemyPrice[0].replace('VND', '').replace('.', '').replace(',', ''))
				}
				enemiesJson.append(topEnemyJson)

			# List others enemy
			enemies = tree.xpath('//*[@id="multisource"]/div[2]/table/tr[2]/td[1]/div/div/a/span/text()')
			enemyPrices = tree.xpath('//*[@id="multisource"]/div[2]/table/tr[2]/td[4]/span/text()')
			if enemies != None and len(enemies) > 0 and enemyPrices != None and len(enemyPrices) > 0:
				for index, enemy in enumerate(enemies):
					if len(enemyPrices) > index:
						enemiesJson.append({
							"name": enemy.replace(' ','').replace('\n', ''),
							"price": int(enemyPrices[index].replace('VND', '').replace('.', ''))
							})

			print ('''{} ({}) enemies: {}'''.format(sku['sku'], user['lazada_user_name'], enemiesJson))
			return enemiesJson
		except Exception as ex:
			print ('''{} ({}) get enemies exception: {}'''.format(sku['sku'], user['lazada_user_name'], str(ex)))
			return None

	#-----------------------------------------------------------------------------
	# Sort algorithm
	#-----------------------------------------------------------------------------
	def sortEnemies(self, enemies):
		return sorted(enemies, key=operator.itemgetter('price'))




