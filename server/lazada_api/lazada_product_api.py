import requests
import json
from lazada_api.lazada_api_helper import LazadaApiHelper
from config import LazadaAPI
from utils.exception_utils import ExceptionUtils



class LazadaProductApi(object):

	#-----------------------------------------------------------------------------
	# Get Produts from Lazada
	#-----------------------------------------------------------------------------
	def getProducts(self, user):
		parameters = {
		'Action': 'GetProducts',
		'Format':'JSON',
		'Timestamp': LazadaApiHelper.getCurrentUTCTime(),
		'UserID': user['lazada_user_id'],
		'Version': '1.0',
		'CreatedBefore': LazadaApiHelper.getCurrentUTCTime(),
		'Filter': 'all'
		}

		parameters['Signature'] = LazadaApiHelper.generateSignature(parameters, user['lazada_api_key'])
		url = "{}/?Action={}&Format={}&Timestamp={}&UserID={}&Version={}&Signature={}&CreatedBefore={}&Filter={}".format(
						LazadaAPI.ENDPOINT,
		 				parameters["Action"],
		 				parameters["Format"],
		 				LazadaApiHelper.formatTimestamp(parameters["Timestamp"]),
		 				parameters["UserID"],
		 				parameters["Version"],
		 				parameters["Signature"],
		 				LazadaApiHelper.formatTimestamp(parameters["CreatedBefore"]),
		 				parameters["Filter"])
		print(url)
		try:
			resp = requests.get(url)
			if resp.status_code == 200:
				response = json.loads(resp.text)
				if ('ErrorResponse' in response):
					return ExceptionUtils.error('''Get Products is error: {}'''.format(esponse['ErrorResponse']['Head']['ErrorMessage']))

				data = response['SuccessResponse']['Body']
				if (data['Products'] != None):
					print(data['Products']['PrimaryCategory'])
					return data['Products']

			return ExceptionUtils.error('''Get Products is error: {}'''.format(resp.status_code))
		except Exception as ex:
			return ExceptionUtils.error('''Get Products is error: {}'''.format(str(ex)))


	