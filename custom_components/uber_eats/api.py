"""Uber Eats API"""
import logging
from datetime import datetime, timedelta
import requests
from requests.auth import HTTPBasicAuth
import json

_LOGGER = logging.getLogger(__name__)

class UberEatsApi:
    def __init__(self, token):
        self._sid = token
        self._locale_code = 'NZ'
        self._timezone = 'Pacific/Auckland'
        self._url_base = 'https://www.ubereats.com/api/getActiveOrdersV1?localeCode=' + self._locale_code
        
    def get_deliveries(self):
        headers = {
            "Content-Type": "application/json",
            "X-CSRF-Token": "x",
            "Cookie": "sid=" + self._sid
        }
        data = {
            "orderUuid": None,
            "timezone": self._timezone,
            "showAppUpsellIllustration": True
        }
        response = requests.post(self._url_base, headers=headers, json=data)
        data = {}
        if response.status_code == requests.codes.ok:
            data = response.json()
            if not data:
                _LOGGER.warning('Fetched deliveries successfully, but did not find any')
            return data
        else:
            _LOGGER.error('Failed to fetch deliveries')
            return data

    def check_auth(self):
        """Check to see if our SID is valid."""
        if self._sid:
            _LOGGER.debug('Login is valid')
            return True
        else:
            return False